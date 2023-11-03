"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendUtilityService = void 0;
const emitterType_enum_1 = require("../enums/emitterType.enum");
class BackendUtilityService {
    constructor(rxjs) {
        this.rxjs = rxjs;
    }
    addRxJsResource(rxjs) {
        this.rxjs = rxjs;
    }
    /** Execute the Backend Processes Callback, that could come from an Observable or a Promise callback */
    executeBackendProcessesCallback(startTime, processResult, backendApi, totalItems) {
        const endTime = new Date();
        // allow the backend service to change the result.
        if (processResult && backendApi.service.postProcess) {
            backendApi.service.postProcess(processResult);
        }
        // define what our internal Post Process callback, only available for GraphQL Service for now
        // it will basically refresh the Dataset & Pagination removing the need for the user to always create his own PostProcess every time
        if (processResult && (backendApi === null || backendApi === void 0 ? void 0 : backendApi.internalPostProcess)) {
            backendApi.internalPostProcess(processResult);
        }
        // send the response process to the postProcess callback
        if (backendApi.postProcess !== undefined) {
            if (processResult instanceof Object) {
                processResult.metrics = {
                    startTime,
                    endTime,
                    executionTime: endTime.valueOf() - startTime.valueOf(),
                    itemCount: totalItems,
                    totalItemCount: totalItems,
                };
            }
            backendApi.postProcess(processResult);
        }
    }
    /** On a backend service api error, we will run the "onError" if there is 1 provided or just throw back the error when nothing is provided */
    onBackendError(e, backendApi) {
        if (typeof (backendApi === null || backendApi === void 0 ? void 0 : backendApi.onError) === 'function') {
            backendApi.onError(e);
        }
        else {
            throw e;
        }
    }
    /**
     * Execute the backend callback, which are mainly the "process" & "postProcess" methods.
     * Also note that "preProcess" was executed prior to this callback
     */
    executeBackendCallback(backendServiceApi, query, args, startTime, totalItems, extraCallbacks) {
        var _a;
        if (backendServiceApi) {
            // emit an onFilterChanged event when it's not called by a clear filter
            if (args && !args.clearFilterTriggered && !args.clearSortTriggered && (extraCallbacks === null || extraCallbacks === void 0 ? void 0 : extraCallbacks.emitActionChangedCallback)) {
                extraCallbacks.emitActionChangedCallback.call(this, emitterType_enum_1.EmitterType.remote);
            }
            // the processes can be Observables (like HttpClient) or Promises
            const process = backendServiceApi.process(query);
            if (process instanceof Promise && process.then) {
                process
                    .then((processResult) => {
                    var _a;
                    this.executeBackendProcessesCallback(startTime, processResult, backendServiceApi, totalItems);
                    (_a = extraCallbacks === null || extraCallbacks === void 0 ? void 0 : extraCallbacks.successCallback) === null || _a === void 0 ? void 0 : _a.call(this, args);
                })
                    .catch((error) => {
                    var _a;
                    (_a = extraCallbacks === null || extraCallbacks === void 0 ? void 0 : extraCallbacks.errorCallback) === null || _a === void 0 ? void 0 : _a.call(this, args);
                    this.onBackendError(error, backendServiceApi);
                });
            }
            else if ((_a = this.rxjs) === null || _a === void 0 ? void 0 : _a.isObservable(process)) {
                const rxjs = this.rxjs;
                // this will abort any previous HTTP requests, that were previously hooked in the takeUntil, before sending a new request
                if (rxjs.isObservable(extraCallbacks === null || extraCallbacks === void 0 ? void 0 : extraCallbacks.httpCancelRequestSubject)) {
                    extraCallbacks === null || extraCallbacks === void 0 ? void 0 : extraCallbacks.httpCancelRequestSubject.next();
                }
                process
                    // the following takeUntil, will potentially be used later to cancel any pending http request (takeUntil another rx, that would be httpCancelRequests$, completes)
                    // but make sure the observable is actually defined with the iif condition check before piping it to the takeUntil
                    .pipe(rxjs.takeUntil(rxjs.iif(() => rxjs.isObservable(extraCallbacks === null || extraCallbacks === void 0 ? void 0 : extraCallbacks.httpCancelRequestSubject), extraCallbacks === null || extraCallbacks === void 0 ? void 0 : extraCallbacks.httpCancelRequestSubject, rxjs.EMPTY)))
                    .subscribe((processResult) => {
                    var _a;
                    this.executeBackendProcessesCallback(startTime, processResult, backendServiceApi, totalItems);
                    (_a = extraCallbacks === null || extraCallbacks === void 0 ? void 0 : extraCallbacks.successCallback) === null || _a === void 0 ? void 0 : _a.call(this, args);
                }, (error) => {
                    var _a;
                    (_a = extraCallbacks === null || extraCallbacks === void 0 ? void 0 : extraCallbacks.errorCallback) === null || _a === void 0 ? void 0 : _a.call(this, args);
                    this.onBackendError(error, backendServiceApi);
                });
            }
        }
    }
    /** Refresh the dataset through the Backend Service */
    refreshBackendDataset(gridOptions) {
        var _a, _b;
        let query = '';
        const backendApi = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.backendServiceApi;
        if (!backendApi || !backendApi.service || !backendApi.process) {
            throw new Error(`BackendServiceApi requires at least a "process" function and a "service" defined`);
        }
        if (backendApi.service) {
            query = backendApi.service.buildQuery();
        }
        if (query && query !== '') {
            // keep start time & end timestamps & return it after process execution
            const startTime = new Date();
            if (backendApi.preProcess) {
                backendApi.preProcess();
            }
            const totalItems = (_b = (_a = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.pagination) === null || _a === void 0 ? void 0 : _a.totalItems) !== null && _b !== void 0 ? _b : 0;
            this.executeBackendCallback(backendApi, query, null, startTime, totalItems);
        }
    }
}
exports.BackendUtilityService = BackendUtilityService;
//# sourceMappingURL=backendUtility.service.js.map