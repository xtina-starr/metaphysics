import fetch from "../lib/apis/fetch"
import { GraphQLObjectType, GraphQLList, GraphQLString } from "graphql"
import Image from "./image"

const SuggestedGeneType = new GraphQLObjectType({
  name: "SuggestedGene",
  fields: {
    id: { type: GraphQLString },
    _id: { type: GraphQLString },
    __id: { type: GraphQLString },
    image_url: { type: GraphQLString },
    image: Image,
    name: { type: GraphQLString },
  },
})

const SUGGESTED_GENES_JSON = "https://s3.amazonaws.com/eigen-production/json/eigen_categories.json"

const SuggestedGenes = {
  type: new GraphQLList(SuggestedGeneType),
  description: "List of curated genes with custom images",
  resolve: () => fetch(SUGGESTED_GENES_JSON).then(({ body }) => body),
}

export default SuggestedGenes
