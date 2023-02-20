import { gql } from '@apollo/client';
import * as Types from '../types.d.js';

export type HumanFieldsFragment = { __typename?: 'Human'; name: string; mass?: number | null };

export const HumanFieldsFragmentDoc = gql`
  fragment HumanFields on Human {
    name
    mass
  }
`;
