export class BasePubSubService {
    /**
     * Method to publish a message
     * @param event The event or channel to publish to.
     * @param data The data to publish on the channel.
     */
    publish(_eventName, _data, _delay) {
        throw new Error('BasePubSubService "publish" method must be implemented');
    }
    /**
      * Subscribes to a message channel or message type.
      * @param event The event channel or event data type.
      * @param callback The callback to be invoked when the specified message is published.
      * @return possibly a Subscription
      */
    // eslint-disable-next-line @typescript-eslint/ban-types
    subscribe(_eventName, _callback) {
        throw new Error('BasePubSubService "subscribe" method must be implemented');
    }
    /**
      * Subscribes to a custom event message channel or message type.
      * This is similar to the "subscribe" except that the callback receives an event typed as CustomEventInit and the data will be inside its "event.detail"
      * @param event The event channel or event data type.
      * @param callback The callback to be invoked when the specified message is published.
      * @return possibly a Subscription
      */
    // eslint-disable-next-line @typescript-eslint/ban-types
    subscribeEvent(_eventName, _callback) {
        throw new Error('BasePubSubService "subscribeEvent" method must be implemented');
    }
    /**
      * Unsubscribes a message name
      * @param event The event name
      * @return possibly a Subscription
      */
    unsubscribe(_eventName, _callback) {
        throw new Error('BasePubSubService "unsubscribe" method must be implemented');
    }
    /** Unsubscribes all subscriptions that currently exists */
    unsubscribeAll(_subscriptions) {
        throw new Error('BasePubSubService "unsubscribeAll" method must be implemented');
    }
}
//# sourceMappingURL=basePubSub.service.js.map