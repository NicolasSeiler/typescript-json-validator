jest.setTimeout(30000);
import rimrafCB from 'rimraf';
import {exec as execCB, ExecOptions} from 'child_process';
import * as path from 'path';
import {promisify} from 'util';
import {promises} from 'fs';
const {copyFile, unlink} = promises;

jest.setTimeout(30000);

const rimraf = promisify(rimrafCB);

const testDir = path.join(__dirname, 'build-parameters');

const exec = (cmd: string, options: ExecOptions): Promise<string> =>
  new Promise((resolve, reject) => {
    execCB(cmd, options, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || stdout || error.message);
      } else {
        resolve(stdout);
      }
    });
  });

const buildProject = async (project: string) => {
  await copyFile(
    path.join(testDir, `tsconfig.${project}.json`),
    path.join(testDir, 'tsconfig.json'),
  );

  await exec(`node ../../../lib/cli ./src/Example.ts ExampleType`, {
    cwd: testDir,
  });
  await exec(
    `node ../../../lib/cli ./src/DisjointUnionExample.ts --collection`,
    {
      cwd: testDir,
    },
  );

  await exec(`npx tsc --project ./tsconfig.json`, {
    cwd: testDir,
  });
};

beforeAll(() => exec('yarn build', {cwd: process.cwd()}));

afterEach(() =>
  Promise.all([
    rimraf(path.join(testDir, 'lib')),
    unlink(path.join(testDir, 'tsconfig.json')),
    unlink(path.join(testDir, 'src/Example.validator.ts')),
  ]),
);

test('ESNext module settings', () =>
  // We expect a project not to build correctly if it has ES module
  // target and no esModuleInterop.
  expect(buildProject('esnext')).rejects.toMatch('Import assignment cannot be used when targeting ECMAScript modules'));

test('ESNext interop module settings', () => buildProject('esnext-interop'));

test('ES2015 module settings', () =>
  expect(buildProject('es2015')).rejects.toMatch('Import assignment cannot be used when targeting ECMAScript modules'));

test('ES2015 interop module settings', () => buildProject('es2015-interop'));

test('UMD module settings', () => buildProject('umd'));

test('UMD interop module settings', () => buildProject('umd-interop'));

test('System module settings', () => buildProject('system'));

test('System interop module settings', () => buildProject('system-interop'));

test('Common JS module settings', () => buildProject('commonjs'));

test('Common JS interop module settings', () =>
  buildProject('commonjs-interop'));
