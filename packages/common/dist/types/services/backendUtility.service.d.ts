import { EmitterType } from '../enums/emitterType.enum';
import type { BackendServiceApi, GridOption } from '../interfaces/index';
import type { RxJsFacade, Subject } from './rxjsFacade';
export interface BackendCallbacks {
    emitActionChangedCallback?: (type: EmitterType) => void;
    errorCallback?: (args: any) => void;
    successCallback?: (args: any) => void;
    httpCancelRequestSubject?: Subject<void>;
}
export declare class BackendUtilityService {
    protected rxjs?: RxJsFacade | undefined;
    constructor(rxjs?: RxJsFacade | undefined);
    addRxJsResource(rxjs: RxJsFacade): void;
    /** Execute the Backend Processes Callback, that could come from an Observable or a Promise callback */
    executeBackendProcessesCallback(startTime: Date, processResult: any, backendApi: BackendServiceApi, totalItems: number): any;
    /** On a backend service api error, we will run the "onError" if there is 1 provided or just throw back the error when nothing is provided */
    onBackendError(e: any, backendApi: BackendServiceApi): void;
    /**
     * Execute the backend callback, which are mainly the "process" & "postProcess" methods.
     * Also note that "preProcess" was executed prior to this callback
     */
    executeBackendCallback(backendServiceApi: BackendServiceApi, query: string, args: any, startTime: Date, totalItems: number, extraCallbacks?: BackendCallbacks): void;
    /** Refresh the dataset through the Backend Service */
    refreshBackendDataset(gridOptions: GridOption): void;
}
//# sourceMappingURL=backendUtility.service.d.ts.map