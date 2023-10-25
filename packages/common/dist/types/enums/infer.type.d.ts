export type InferType<T> = T extends infer R ? R : any;
export type InferDOMType<T> = T extends CSSStyleDeclaration ? Partial<CSSStyleDeclaration> : T extends infer R ? R : any;
//# sourceMappingURL=infer.type.d.ts.map