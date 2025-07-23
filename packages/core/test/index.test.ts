import { expect } from 'chai';

import { add, greet, Logger } from '../src/index.js';

describe('Core utilities', () => {
  describe('greet', () => {
    it('should return a greeting message', () => {
      expect(greet('World')).to.equal('Hello, World!');
    });
  });

  describe('add', () => {
    it('should add two numbers correctly', () => {
      expect(add(2, 3)).to.equal(5);
      expect(add(-1, 1)).to.equal(0);
    });
  });

  describe('Logger', () => {
    it('should create a logger with default prefix', () => {
      const logger = new Logger();
      expect(logger).to.be.instanceOf(Logger);
    });

    it('should create a logger with custom prefix', () => {
      const logger = new Logger('TEST');
      expect(logger).to.be.instanceOf(Logger);
    });
  });
});
