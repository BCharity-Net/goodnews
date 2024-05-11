import type { CodegenConfig } from '@graphql-codegen/cli';

import LensEndpoint from '@good/data/lens-endpoints';

const config: CodegenConfig = {
  customFetch: 'node-fetch',
  documents: './documents/**/*.graphql',
  generates: {
    'generated.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
        'fragment-matcher'
      ]
    }
  },
  hooks: {
    afterOneFileWrite: ['eslint --fix', 'prettier --write']
  },
  overwrite: true,
  schema: LensEndpoint.Staging
};

export default config;
