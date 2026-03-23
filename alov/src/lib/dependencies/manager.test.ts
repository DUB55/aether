/**
 * DependencyManager Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyManager } from './manager';

describe('DependencyManager', () => {
  let manager: DependencyManager;

  beforeEach(() => {
    manager = DependencyManager.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DependencyManager.getInstance();
      const instance2 = DependencyManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Dependency Detection', () => {
    it('should detect ES6 imports', () => {
      const code = `
        import React from 'react';
        import { useState } from 'react';
        import axios from 'axios';
      `;
      
      const deps = manager.detectDependencies(code);
      expect(deps).toContain('react');
      expect(deps).toContain('axios');
    });

    it('should detect CommonJS requires', () => {
      const code = `
        const express = require('express');
        const fs = require('fs');
      `;
      
      const deps = manager.detectDependencies(code);
      expect(deps).toContain('express');
      expect(deps).not.toContain('fs'); // Built-in module
    });

    it('should detect dynamic imports', () => {
      const code = `
        const module = await import('lodash');
        import('moment').then(m => console.log(m));
      `;
      
      const deps = manager.detectDependencies(code);
      expect(deps).toContain('lodash');
      expect(deps).toContain('moment');
    });

    it('should detect scoped packages', () => {
      const code = `
        import { Button } from '@radix-ui/react-button';
        const pkg = require('@testing-library/react');
      `;
      
      const deps = manager.detectDependencies(code);
      expect(deps).toContain('@radix-ui/react-button');
      expect(deps).toContain('@testing-library/react');
    });

    it('should ignore relative imports', () => {
      const code = `
        import Component from './Component';
        import utils from '../utils';
        const local = require('./local');
      `;
      
      const deps = manager.detectDependencies(code);
      expect(deps).toHaveLength(0);
    });

    it('should ignore built-in Node modules', () => {
      const code = `
        import fs from 'fs';
        import path from 'path';
        const http = require('http');
      `;
      
      const deps = manager.detectDependencies(code);
      expect(deps).toHaveLength(0);
    });

    it('should remove duplicates', () => {
      const code = `
        import React from 'react';
        import { useState } from 'react';
        const React2 = require('react');
      `;
      
      const deps = manager.detectDependencies(code);
      expect(deps).toEqual(['react']);
    });
  });

  describe('Package.json Management', () => {
    it('should generate package.json with dependencies', () => {
      const deps = ['react', 'react-dom', 'axios'];
      const packageJson = manager.generatePackageJson('test-project', deps);
      
      const parsed = JSON.parse(packageJson);
      expect(parsed.name).toBe('test-project');
      expect(parsed.dependencies).toHaveProperty('react');
      expect(parsed.dependencies).toHaveProperty('react-dom');
      expect(parsed.dependencies).toHaveProperty('axios');
    });

    it('should use latest version for dependencies', () => {
      const deps = ['react'];
      const packageJson = manager.generatePackageJson('test', deps);
      
      const parsed = JSON.parse(packageJson);
      expect(parsed.dependencies.react).toBe('latest');
    });
  });

  describe('Installation Status', () => {
    it('should track installation progress', () => {
      expect(manager.isInstalling()).toBe(false);
      
      // Start installation (mock)
      manager['installing'] = true;
      expect(manager.isInstalling()).toBe(true);
      
      // Reset
      manager['installing'] = false;
    });

    it('should provide installation logs', () => {
      const logs = manager.getInstallationLogs();
      expect(Array.isArray(logs)).toBe(true);
    });
  });
});
