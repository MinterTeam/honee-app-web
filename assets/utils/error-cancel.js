export default class CancelError extends Error {
    constructor(message = 'Canceled') {
        super(message);
        this.name = 'CancelError';
        this.isCanceled = true;
    }
}
