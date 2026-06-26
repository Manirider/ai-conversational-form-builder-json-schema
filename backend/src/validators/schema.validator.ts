import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { JSONSchema } from '../types';
import { logger } from '../utils/logger';




const ajv = new Ajv({
  allErrors: true,
  strict: false,
  validateFormats: true,
});
addFormats(ajv);




const REQUIRED_SCHEMA_PROPERTIES = ['type', 'properties'];





export function validateSchema(schema: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];


  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return { valid: false, errors: ['Schema must be a non-null object'] };
  }

  const s = schema as JSONSchema;


  if (s.type !== 'object') {
    errors.push(`Root type must be "object", got "${s.type}"`);
  }


  if (!s.properties || typeof s.properties !== 'object') {
    errors.push('Schema must have a "properties" object');
  } else {

    for (const [fieldName, fieldDef] of Object.entries(s.properties)) {
      if (!fieldDef || typeof fieldDef !== 'object') {
        errors.push(`Property "${fieldName}" must be an object`);
        continue;
      }

      if (!fieldDef.type && !fieldDef.$ref && !fieldDef.oneOf && !fieldDef.anyOf && !fieldDef.allOf) {
        errors.push(
          `Property "${fieldName}" must have a "type", "$ref", or composition keyword`,
        );
      }
    }
  }


  if (s.required) {
    if (!Array.isArray(s.required)) {
      errors.push('"required" must be an array');
    } else if (s.properties) {
      for (const field of s.required) {
        if (!(field in s.properties)) {
          errors.push(
            `Required field "${field}" not found in properties`,
          );
        }
      }
    }
  }


  try {

    const testAjv = new Ajv({ allErrors: true, strict: false });
    addFormats(testAjv);
    testAjv.compile(s as object);
  } catch (compileError) {
    const errorMessage = compileError instanceof Error
      ? compileError.message
      : String(compileError);
    errors.push(`AJV compilation failed: ${errorMessage}`);
  }

  const valid = errors.length === 0;

  if (!valid) {
    logger.debug('Schema validation failed', { errorCount: errors.length, errors });
  }

  return { valid, errors };
}




export function isClarificationResponse(parsed: unknown): parsed is {
  status: 'clarification_needed';
  questions: string[];
} {
  if (!parsed || typeof parsed !== 'object') return false;
  const obj = parsed as Record<string, unknown>;
  return (
    obj.status === 'clarification_needed' &&
    Array.isArray(obj.questions) &&
    obj.questions.length > 0
  );
}
