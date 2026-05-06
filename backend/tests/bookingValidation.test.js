const test = require('node:test');
const assert = require('node:assert/strict');
const { validationResult } = require('express-validator');

const {
    availableSlotsValidation,
    createBookingValidation,
} = require('../src/validations/bookingValidation');

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_UUID_2 = '123e4567-e89b-12d3-a456-426614174001';

const runValidation = async (validators, req) => {
    for (const validator of validators) {
        await validator.run(req);
    }

    return validationResult(req)
        .array()
        .map((error) => error.msg);
};

test('availableSlotsValidation passes with workerId and valid date', async () => {
    const req = {
        query: {
            date: '2099-01-10',
            workerId: VALID_UUID,
        },
    };

    const errors = await runValidation(availableSlotsValidation, req);
    assert.deepEqual(errors, []);
});

test('availableSlotsValidation fails if workerId and barberId are both missing', async () => {
    const req = {
        query: {
            date: '2099-01-10',
        },
    };

    const errors = await runValidation(availableSlotsValidation, req);
    assert.ok(errors.includes('workerId is required'));
});

test('createBookingValidation passes with barberId payload', async () => {
    const req = {
        body: {
            barberId: VALID_UUID,
            bookingDate: '2099-01-10',
            startTime: '09:00',
            endTime: '09:30',
            serviceIds: [VALID_UUID_2],
            notes: 'test',
        },
    };

    const errors = await runValidation(createBookingValidation, req);
    assert.deepEqual(errors, []);
});

test('createBookingValidation fails when workerId/barberId missing', async () => {
    const req = {
        body: {
            bookingDate: '2099-01-10',
            startTime: '09:00',
            endTime: '09:30',
            serviceIds: [VALID_UUID],
        },
    };

    const errors = await runValidation(createBookingValidation, req);
    assert.ok(errors.includes('barberId is required'));
});
