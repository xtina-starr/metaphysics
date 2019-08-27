import { GraphQLString } from "graphql"
import { mutationWithClientMutationId } from "graphql-relay"
import { GeneType } from "../gene"
import { ResolverContext } from "types/graphql"

export default mutationWithClientMutationId<any, any, ResolverContext>({
  name: "FollowGene",
  description: "Follow (or unfollow) an gene",
  inputFields: {
    geneID: { type: GraphQLString },
  } /*
  FIXME: Generated by the snake_case to camelCase codemod.
         Either use this to fix inputs and/or remove this comment.
  {
    const {
      geneID
    } = newFields;
    const oldFields = {
      geneID: gene_id
    };
  }
  */,
  outputFields: {
    gene: {
      type: GeneType,
      resolve: ({ gene }, _options, { geneLoader }) => geneLoader(gene.id),
    },
  },
  mutateAndGetPayload: ({ geneID }, { followGeneLoader }) => {
    const options: any = {
      gene_id: geneID,
    }
    if (!followGeneLoader) {
      throw new Error("Missing Follow Gene Loader. Check your access token.")
    }
    return followGeneLoader(options)
  },
})