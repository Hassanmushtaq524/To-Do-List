
module.exports.getDate = function () {
    var date = new Date();
    var options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }

    var currentDay = date.toLocaleDateString('en-us', options);
    return currentDay;
}