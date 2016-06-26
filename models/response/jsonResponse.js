var jsonResponse = function () {
    this.status = 'success';
    this.message = undefined;
    this.data = undefined;
};

jsonResponse.prototype.makeSuccess = function(data) {
    this.status = 'success';
    this.data = data || null;
    return this;
};

jsonResponse.prototype.makeFailure = function(data) {
    this.status = 'fail';
    this.data = data || null;
    return this;
};

jsonResponse.prototype.makeError = function(message, data) {
    this.status = 'error';
    this.message = message || '';
    this.data = data || undefined;
    return this;
};

module.exports = jsonResponse;