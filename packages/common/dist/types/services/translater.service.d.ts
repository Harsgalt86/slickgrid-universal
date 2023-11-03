import type { BasePubSubService } from '@slickgrid-universal/event-pub-sub';
export type TranslateServiceEventName = 'onLanguageChanged';
export declare abstract class TranslaterService {
    eventName?: TranslateServiceEventName;
    /**
     * Add an optional Pub/Sub Messaging Service,
     * when defined the Translate Service will call the publish method with "onLanguageChanged" event name whenever the "use()" method is called
     * @param {BasePubSubService} pubSub
     */
    addPubSubMessaging?(_pubSubService: BasePubSubService): void;
    /**
     * Method to return the current language used by the App
     * @return {string} current language
     */
    getCurrentLanguage(): string;
    /**
     * Method which receives a translation key and returns the translated value from that key
     * @param {string} translation key
     * @return {string} translated value
     */
    translate(_translationKey: string, _params?: any): string;
    /**
     * Method to set the language to use in the App and Translate Service
     * @param {string} language
     * @return {object} output - returns a Promise with the locale set (typically a JSON object)
     */
    use(_language: string): Promise<any> | any;
}
//# sourceMappingURL=translater.service.d.ts.map