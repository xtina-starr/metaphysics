import gravity from '../lib/loaders/gravity';
import cached from './fields/cached';
import initials from './fields/initials';
import Profile from './profile';
import PartnerShow from './partner_show';
import Location from './location';
import { compact, filter, forEach, sortBy, map } from 'lodash';
import { toSentence } from 'underscore.string';
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} from 'graphql';

const PartnerType = new GraphQLObjectType({
  name: 'Partner',
  fields: () => ({
    cached,
    _id: {
      type: GraphQLString,
    },
    id: {
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
      resolve: ({ name }) => name.trim(),
    },
    type: {
      type: GraphQLString,
    },
    href: {
      type: GraphQLString,
      resolve: ({ default_profile_id }) => `/${default_profile_id}`,
    },
    is_linkable: {
      type: GraphQLBoolean,
      resolve: ({ default_profile_id, default_profile_public }) => {
        return default_profile_id && default_profile_public;
      },
    },
    is_pre_qualify: {
      type: GraphQLBoolean,
      resolve: ({ pre_qualify }) => pre_qualify,
    },
    is_limited_fair_partner: {
      type: GraphQLBoolean,
      resolve: ({ has_limited_fair_partnership }) => has_limited_fair_partnership,
    },
    initials: initials('name'),
    default_profile_id: {
      type: GraphQLString,
    },
    profile: {
      type: Profile.type,
      resolve: ({ default_profile_id }) =>
        gravity(`profile/${default_profile_id}`)
          .catch(() => null),
    },
    shows: {
      type: new GraphQLList(PartnerShow.type),
      args: {
        size: {
          type: GraphQLInt,
        },
      },
      resolve: ({ id }, options) => gravity(`partner/${id}/shows`, options),
    },
    fair_highlights: {
      type: GraphQLString,
      args: {
        size: {
          type: GraphQLInt,
          defaultValue: 10,
        },
        at_a_fair: {
          type: GraphQLBoolean,
          defaultValue: true,
        },
      },
      resolve: ({ _id }, options) => {
        return gravity(`partner/${_id}/shows`, options).then(shows => {
          const fairShows = filter(shows, (show) => { return show.fair != null });
          const sortedFairs = sortBy(fairShows, (show) => {
            const sizes = {
              'x-large' : 1,
              'large' : 2,
              'medium' : 3,
              'small' : 4,
              'x-small' : 5,
            };
            return sizes[show.fair.banner_size];
          });

          if (sortedFairs.length < 1) return;

          const fairs = sortedFairs.slice(0,3);
          const remaining = sortedFairs.length - fairs.length;

          const fairNames = map(fairs, 'fair.name');
          const remainingString = remaining > 0 ? ` & ${remaining} more` : ``;

          const sentence = `Exhibitor at ` + toSentence(fairNames) + remainingString
          console.log('sentence', sentence);
          return sentence;
        });
      },
    },
    locations: {
      type: new GraphQLList(Location.type),
      args: {
        size: {
          type: GraphQLInt,
        },
      },
      resolve: ({ id }, options) => gravity(`partner/${id}/locations`, options),
    },
    contact_message: {
      type: GraphQLString,
      resolve: ({ type }) => {
        if (type === 'Auction') {
          return [
            'Hello, I am interested in placing a bid on this work.',
            'Please send me more information.',
          ].join(' ');
        }
        return [
          'Hi, I’m interested in purchasing this work.',
          'Could you please provide more information about the piece?',
        ].join(' ');
      },
    },
  }),
});

const Partner = {
  type: PartnerType,
  description: 'A Partner',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The slug or ID of the Partner',
    },
  },
  resolve: (root, { id }) => gravity(`partner/${id}`),
};

export default Partner;
