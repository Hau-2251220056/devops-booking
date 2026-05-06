const test = require('node:test');
const assert = require('node:assert/strict');

const { generateTimeSlots } = require('../src/utils/generateTimeSlots');

const FUTURE_DATE = '2099-01-10';

test('generateTimeSlots returns sorted 30-minute slots within fixed working window', () => {
    const slots = generateTimeSlots({ date: FUTURE_DATE, existingBookings: [] });

    assert.equal(slots.length, 16);
    assert.equal(slots[0].start, '07:30');
    assert.equal(slots[0].end, '08:00');
    assert.equal(slots[slots.length - 1].start, '17:00');
    assert.equal(slots[slots.length - 1].end, '17:30');

    for (let i = 1; i < slots.length; i += 1) {
        assert.ok(slots[i - 1].start < slots[i].start);
    }
});

test('generateTimeSlots excludes lunch break from 11:30 to 13:30', () => {
    const slots = generateTimeSlots({ date: FUTURE_DATE, existingBookings: [] });

    const hasLunchSlots = slots.some(
        (slot) => slot.start < '13:30' && slot.end > '11:30',
    );

    assert.equal(hasLunchSlots, false);
});

test('generateTimeSlots marks overlapping bookings as unavailable', () => {
    const slots = generateTimeSlots({
        date: FUTURE_DATE,
        existingBookings: [{ startTime: '08:15', endTime: '08:45' }],
    });

    const slot0800 = slots.find((slot) => slot.start === '08:00');
    const slot0830 = slots.find((slot) => slot.start === '08:30');
    const slot0900 = slots.find((slot) => slot.start === '09:00');

    assert.equal(slot0800.available, false);
    assert.equal(slot0830.available, false);
    assert.equal(slot0900.available, true);
});

test('generateTimeSlots returns empty array for invalid date', () => {
    const slots = generateTimeSlots({
        date: 'invalid-date',
        existingBookings: [],
    });
    assert.deepEqual(slots, []);
});
