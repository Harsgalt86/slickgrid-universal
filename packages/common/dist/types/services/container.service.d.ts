export interface ContainerInstance {
    key: any;
    instance: any;
}
export declare class ContainerService {
    get<T = any>(_key: any): T | null;
    registerInstance(_key: any, _instance: any): void;
}
//# sourceMappingURL=container.service.d.ts.map