/**
 * This GraphqlQueryBuilder class is a lib that already existed
 * but was causing issues with TypeScript, RequireJS and other bundler/packagers,
 * so I simply rewrote the code in TypeScript to make it easier to import.
 *
 * The previous lib can be found here at this Github link:
 *     https://github.com/codemeasandwich/graphql-query-builder
 * With an MIT licence that and can be found at
 *     https://github.com/codemeasandwich/graphql-query-builder/blob/master/LICENSE
 */
export default class GraphqlQueryBuilder {
    protected queryFnName: string;
    alias: string | Function;
    head: any[];
    body: any;
    constructor(queryFnName: string, aliasOrFilter?: string | object);
    /**
     * The parameters to run the query against.
     * @param filters An object mapping attribute to values
     */
    filter(filters: any): this;
    /**
     * Outlines the properties you wish to be returned from the query.
     * @param properties representing each attribute you want Returned
     */
    find(...searches: any[]): this;
    /**
     * set an alias for this result.
     * @param alias
     */
    setAlias(alias: string): void;
    /**
     * Return to the formatted query string
     * @return
     */
    toString(): string;
    protected parceFind(_levelA: any[]): string;
    protected getGraphQLValue(value: any): any;
    protected objectToString(obj: any): string;
}
//# sourceMappingURL=graphqlQueryBuilder.d.ts.map