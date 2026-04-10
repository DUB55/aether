// Supabase integration service
// Provides schema builder and database management for Supabase projects

export interface SupabaseConfig {
  url: string
  anonKey: string
  projectId: string
}

export interface TableSchema {
  name: string
  columns: ColumnSchema[]
  primaryKeys: string[]
  foreignKeys?: ForeignKeySchema[]
  indexes?: IndexSchema[]
  rlsPolicies?: RLSPolicySchema[]
}

export interface ColumnSchema {
  name: string
  type: 'text' | 'varchar' | 'integer' | 'bigint' | 'boolean' | 'timestamp' | 'timestamptz' | 'date' | 'json' | 'jsonb' | 'uuid' | 'decimal' | 'float' | 'array'
  nullable: boolean
  defaultValue?: string
  isPrimaryKey: boolean
  isUnique?: boolean
}

export interface ForeignKeySchema {
  column: string
  referencedTable: string
  referencedColumn: string
  onDelete?: 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'NO ACTION' | 'RESTRICT'
  onUpdate?: 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'NO ACTION' | 'RESTRICT'
}

export interface IndexSchema {
  name: string
  columns: string[]
  unique: boolean
}

export interface RLSPolicySchema {
  name: string
  table: string
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL'
  using?: string
  withCheck?: string
  enabled: boolean
}

const SUPABASE_CONFIG_STORAGE_KEY = 'aether_supabase_config';

export const supabaseService = {
  // Save Supabase configuration
  saveConfig: (config: SupabaseConfig): void => {
    localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  },

  // Get Supabase configuration
  getConfig: (): SupabaseConfig | null => {
    const stored = localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Clear Supabase configuration
  clearConfig: (): void => {
    localStorage.removeItem(SUPABASE_CONFIG_STORAGE_KEY);
  },

  // Generate SQL CREATE TABLE statement from schema
  generateCreateTableSQL: (schema: TableSchema): string => {
    const columnsSQL = schema.columns.map(col => {
      let colSQL = `  ${col.name} ${col.type.toUpperCase()}`;
      
      if (!col.nullable) {
        colSQL += ' NOT NULL';
      }
      
      if (col.defaultValue) {
        colSQL += ` DEFAULT ${col.defaultValue}`;
      }
      
      if (col.isUnique) {
        colSQL += ' UNIQUE';
      }
      
      return colSQL;
    }).join(',\n');

    let sql = `CREATE TABLE ${schema.name} (\n${columnsSQL}`;

    if (schema.primaryKeys.length > 0) {
      sql += `,\n  PRIMARY KEY (${schema.primaryKeys.join(', ')})`;
    }

    if (schema.foreignKeys && schema.foreignKeys.length > 0) {
      const foreignKeysSQL = schema.foreignKeys.map(fk => {
        let fkSQL = `  FOREIGN KEY (${fk.column}) REFERENCES ${fk.referencedTable}(${fk.referencedColumn})`;
        if (fk.onDelete) {
          fkSQL += ` ON DELETE ${fk.onDelete}`;
        }
        if (fk.onUpdate) {
          fkSQL += ` ON UPDATE ${fk.onUpdate}`;
        }
        return fkSQL;
      }).join(',\n');
      sql += `,\n${foreignKeysSQL}`;
    }

    sql += '\n);';

    // Add indexes
    if (schema.indexes && schema.indexes.length > 0) {
      schema.indexes.forEach(idx => {
        sql += `\n\nCREATE ${idx.unique ? 'UNIQUE ' : ''}INDEX ${idx.name} ON ${schema.name} (${idx.columns.join(', ')});`;
      });
    }

    return sql;
  },

  // Generate RLS policies SQL
  generateRLSPoliciesSQL: (policies: RLSPolicySchema[]): string => {
    return policies.map(policy => {
      let sql = `ALTER TABLE ${policy.table} `;
      
      if (policy.enabled) {
        sql += `ENABLE ROW LEVEL SECURITY;\n\n`;
        sql += `DROP POLICY IF EXISTS "${policy.name}" ON ${policy.table};\n`;
        sql += `CREATE POLICY "${policy.name}" ON ${policy.table}\n`;
        sql += `  FOR ${policy.operation}\n`;
        
        if (policy.using) {
          sql += `  USING (${policy.using})\n`;
        }
        
        if (policy.withCheck) {
          sql += `  WITH CHECK (${policy.withCheck})\n`;
        }
      } else {
        sql += `DISABLE ROW LEVEL SECURITY;`;
      }
      
      return sql + ';';
    }).join('\n\n');
  },

  // Generate complete schema SQL
  generateSchemaSQL: (schemas: TableSchema[]): string => {
    const tablesSQL = schemas.map(schema => supabaseService.generateCreateTableSQL(schema)).join('\n\n');
    
    const allPolicies = schemas.flatMap(schema => schema.rlsPolicies || []);
    const policiesSQL = allPolicies.length > 0 ? supabaseService.generateRLSPoliciesSQL(allPolicies) : '';
    
    return tablesSQL + (policiesSQL ? '\n\n' + policiesSQL : '');
  },

  // Validate schema
  validateSchema: (schema: TableSchema): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!schema.name || schema.name.trim() === '') {
      errors.push('Table name is required');
    }

    if (!/^[a-z_][a-z0-9_]*$/.test(schema.name)) {
      errors.push('Table name must be lowercase and start with a letter or underscore');
    }

    if (schema.columns.length === 0) {
      errors.push('Table must have at least one column');
    }

    if (schema.primaryKeys.length === 0) {
      errors.push('Table must have at least one primary key');
    }

    const columnNames = new Set<string>();
    schema.columns.forEach(col => {
      if (!col.name || col.name.trim() === '') {
        errors.push(`Column name is required`);
      }

      if (!/^[a-z_][a-z0-9_]*$/.test(col.name)) {
        errors.push(`Column "${col.name}" must be lowercase and start with a letter or underscore`);
      }

      if (columnNames.has(col.name)) {
        errors.push(`Duplicate column name: "${col.name}"`);
      }

      columnNames.add(col.name);
    });

    schema.primaryKeys.forEach(pk => {
      if (!columnNames.has(pk)) {
        errors.push(`Primary key column "${pk}" does not exist in table`);
      }
    });

    if (schema.foreignKeys) {
      schema.foreignKeys.forEach(fk => {
        if (!columnNames.has(fk.column)) {
          errors.push(`Foreign key column "${fk.column}" does not exist in table`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Get common column types
  getColumnTypes(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'text', label: 'Text', description: 'Variable-length text string' },
      { value: 'varchar', label: 'Varchar', description: 'Variable-length character string with limit' },
      { value: 'integer', label: 'Integer', description: 'Whole number (4 bytes)' },
      { value: 'bigint', label: 'Bigint', description: 'Whole number (8 bytes)' },
      { value: 'boolean', label: 'Boolean', description: 'True or false' },
      { value: 'timestamp', label: 'Timestamp', description: 'Date and time without timezone' },
      { value: 'timestamptz', label: 'Timestamp with TZ', description: 'Date and time with timezone' },
      { value: 'date', label: 'Date', description: 'Calendar date (year, month, day)' },
      { value: 'json', label: 'JSON', description: 'Textual JSON data' },
      { value: 'jsonb', label: 'JSONB', description: 'Binary JSON data (efficient)' },
      { value: 'uuid', label: 'UUID', description: 'Universally unique identifier' },
      { value: 'decimal', label: 'Decimal', description: 'Exact numeric with specified precision' },
      { value: 'float', label: 'Float', description: 'Floating-point number' },
      { value: 'array', label: 'Array', description: 'Array of values' }
    ];
  },

  // Create a new empty schema
  createEmptySchema: (tableName: string): TableSchema => {
    return {
      name: tableName.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      columns: [
        {
          name: 'id',
          type: 'uuid',
          nullable: false,
          defaultValue: 'gen_random_uuid()',
          isPrimaryKey: true
        },
        {
          name: 'created_at',
          type: 'timestamptz',
          nullable: false,
          defaultValue: 'now()',
          isPrimaryKey: false
        },
        {
          name: 'updated_at',
          type: 'timestamptz',
          nullable: false,
          defaultValue: 'now()',
          isPrimaryKey: false
        }
      ],
      primaryKeys: ['id'],
      foreignKeys: [],
      indexes: [],
      rlsPolicies: []
    };
  },

  // Execute SQL via Supabase API
  executeSQL: async (config: SupabaseConfig, sql: string): Promise<{ success: boolean; error?: string; data?: any }> => {
    try {
      const response = await fetch(`${config.url}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ sql })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to execute SQL'
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute SQL'
      };
    }
  },

  // Get table schemas from Supabase
  getTableSchemas: async (config: SupabaseConfig): Promise<{ success: boolean; schemas?: TableSchema[]; error?: string }> => {
    try {
      const response = await fetch(`${config.url}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': config.anonKey,
          'Authorization': `Bearer ${config.anonKey}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to fetch schemas'
        };
      }

      // This is a simplified version - in production, you'd need to query the information schema
      return {
        success: true,
        schemas: []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch schemas'
      };
    }
  }
};
