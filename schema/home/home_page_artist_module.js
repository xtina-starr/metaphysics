import {
  has,
  map,
} from 'lodash';
import Artist from '../artist';
import gravity from '../../lib/loaders/gravity';
import { NodeInterface } from '../object_identification';
import { toGlobalId } from 'graphql-relay';
import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

// This object is used for both the `key` argument enum and to do fetching.
export const HomePageArtistModuleTypes = {
  SUGGESTED: {
    description: 'Artists recommended for the specific user.',
    fetch: (accessToken, userID) => {
      return gravity.with(accessToken)(`user/${userID}/suggested/similar/artists`);
    },
    display: (accessToken, userID) => {
      const fetch = HomePageArtistModuleTypes.SUGGESTED.fetch;
      return Promise.resolve(!!(accessToken && userID)).then(display => {
        return display && fetch(accessToken, userID).then(results => {
          return results.length > 0;
        });
      });
    },
    resolve: (accessToken, userID) => {
      if (!accessToken || !userID) {
        throw new Error('Both the X-USER-ID and X-ACCESS-TOKEN headers are required.');
      }
      const fetch = HomePageArtistModuleTypes.SUGGESTED.fetch;
      return fetch(accessToken, userID).then(results => {
        return map(results, 'artist');
      });
    },
  },
  TRENDING: {
    description: 'The trending artists.',
    display: () => Promise.resolve(true),
    resolve: () => gravity('artists/trending'),
  },
  POPULAR: {
    description: 'The most searched for artists.',
    display: () => Promise.resolve(true),
    resolve: () => gravity('artists/popular'),
  },
};

export const HomePageArtistModuleType = new GraphQLObjectType({
  name: 'HomePageArtistModule',
  interfaces: [NodeInterface],
  isTypeOf: (obj) => has(obj, 'key') && !has(obj, 'display'),
  fields: {
    __id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A globally unique ID.',
      resolve: ({ key }) => {
        return toGlobalId('HomePageArtistModule', JSON.stringify({ key }));
      },
    },
    key: {
      description: 'Module identifier.',
      type: GraphQLString,
    },
    results: {
      type: new GraphQLList(Artist.type),
      resolve: ({ key, display, params }, options, { rootValue: { accessToken, userID } }) => {
        return HomePageArtistModuleTypes[key].resolve(accessToken, userID);
      },
    },
  },
});

const HomePageArtistModule = {
  type: HomePageArtistModuleType,
  description: 'Single artist module to show on the home screen.',
  args: {
    key: {
      description: 'Module identifier.',
      type: new GraphQLEnumType({
        name: 'HomePageArtistModuleTypes',
        values: HomePageArtistModuleTypes,
      }),
    },
  },
  resolve: (root, obj) => obj.key && HomePageArtistModuleTypes[obj.key] ? obj : null,
};

export default HomePageArtistModule;
