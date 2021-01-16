import {writeFileSync} from 'fs';
import {basename} from 'path';
import {parseArgs} from './parseArgs';
import parse from './parse';
import {
  printSingleTypeValidator,
  printTypeCollectionValidator,
} from './printValidator';
import prettierFile from './prettierFile';
import normalizeSchema from './normalizeSchema';

export {
  parse,
  parseArgs,
  printSingleTypeValidator,
  printTypeCollectionValidator,
};

export default function run(args?: string[]) {
  const {files, options} = parseArgs(args);
  const parsed = parse(
    files.map(f => f.fileName),
    options.schema,
  );

  files.forEach(({fileName, typeName}) => {
    const outputFileName = fileName.replace(/\.tsx?$/, '.validator.ts');
    let validator: string;
    if (typeName) {
      const schema = parsed.getType(typeName);
      validator = printSingleTypeValidator(
        typeName,
        options.useNamedExport,
        normalizeSchema(schema),
        `./${basename(fileName, /\.ts$/.test(fileName) ? '.ts' : '.tsx')}`,
        parsed.compilerOptions,
        options.ajv,
      );
    } else {
      const {symbols, schema} = parsed.getAllTypes();
      validator = printTypeCollectionValidator(
        symbols,
        normalizeSchema(schema),
        `./${basename(fileName, /\.ts$/.test(fileName) ? '.ts' : '.tsx')}`,
        parsed.compilerOptions,
        options.ajv,
      );
    }
    writeFileSync(outputFileName, validator);
    prettierFile(outputFileName);
  });
}
