function generateSubscriptionId() {
    return 'sub_' + Math.random().toString(36).substring(2, 15);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatEventTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
}

function truncateEventId(eventId, length = 16) {
    return eventId.substring(0, length) + '...';
}