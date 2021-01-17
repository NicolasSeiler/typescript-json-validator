import {resolve, join} from 'path';
import * as TJS from 'typescript-json-schema';
import { createProjectSync } from '@ts-morph/bootstrap';
import { cwd } from 'process';
const normalize = require('normalize-path');

// TODO: Use asynchronous variants of functions
export default function parse(
  filenames: string[],
  settings: TJS.PartialArgs = {},
) {
  filenames = filenames.map(f => resolve(f)).map(f => normalize(f));
  const project = createProjectSync({ tsConfigFilePath: join(cwd(), "tsconfig.json"), skipAddingFilesFromTsConfig: true });
  filenames.forEach(file => project.addSourceFileAtPathSync(file));
  const typeRoots = project.compilerOptions.get().typeRoots;
  if (typeRoots) {
    typeRoots.filter(typeRoot => !typeRoot.includes("node_modules/@types")).forEach(typeRoot => project.addSourceFilesByPathsSync(join(typeRoot, "**/*.d.ts")));
  }
  const program = project.createProgram();

  const generator = TJS.buildGenerator(program, {
    rejectDateType: true,
    aliasRef: true,
    required: true,
    topRef: true,
    strictNullChecks: true,
    ...settings,
  });

  if (!generator) {
    throw new Error('Did not expect generator to be null');
  }

  return {
    getAllTypes(includeReffedDefinitions = true, ...fns: string[]) {
      const symbols = generator.getMainFileSymbols(
        program,
        fns.length ? fns : filenames,
      );
      const schema = generator.getSchemaForSymbols(
        symbols,
        includeReffedDefinitions,
      );

      return {symbols, schema};
    },
    getType(name: string) {
      return generator.getSchemaForSymbol(name);
    },
    compilerOptions: project.compilerOptions.get()
  };
}
