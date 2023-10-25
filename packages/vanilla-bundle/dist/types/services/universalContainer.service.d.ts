import type { ContainerInstance, ContainerService } from '@slickgrid-universal/common';
export declare class UniversalContainerService implements ContainerService {
    dependencies: ContainerInstance[];
    get<T = any>(key: string): T | null;
    dispose(): void;
    registerInstance(key: string, instance: any): void;
}
//# sourceMappingURL=universalContainer.service.d.ts.map