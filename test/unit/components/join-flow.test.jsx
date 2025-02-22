import React from 'react';
const {shallowWithIntl} = require('../../helpers/intl-helpers.jsx');
const defaults = require('lodash.defaultsdeep');
import configureStore from 'redux-mock-store';
import JoinFlow from '../../../src/components/join-flow/join-flow';
import Progression from '../../../src/components/progression/progression.jsx';
import RegistrationErrorStep from '../../../src/components/join-flow/registration-error-step';

describe('JoinFlow', () => {
    const mockStore = configureStore();
    let store;

    beforeEach(() => {
        store = mockStore({sessionActions: {
            refreshSession: jest.fn()
        }});
    });

    const getJoinFlowWrapper = props => {
        const wrapper = shallowWithIntl(
            <JoinFlow
                {...props}
            />
            , {context: {store}}
        );
        return wrapper
            .dive() // unwrap redux connect(injectIntl(JoinFlow))
            .dive(); // unwrap injectIntl(JoinFlow)
    };

    test('handleRegistrationResponse with successful response', () => {
        const props = {
            refreshSession: jest.fn()
        };
        const joinFlowInstance = getJoinFlowWrapper(props).instance();
        const responseErr = null;
        const responseBody = [
            {
                success: true
            }
        ];
        const responseObj = {
            statusCode: 200
        };
        joinFlowInstance.handleRegistrationResponse(responseErr, responseBody, responseObj);
        expect(joinFlowInstance.props.refreshSession).toHaveBeenCalled();
        expect(joinFlowInstance.state.registrationError).toBe(null);
    });

    test('handleRegistrationResponse with healthy response, indicating failure', () => {
        const props = {
            refreshSession: jest.fn()
        };
        const joinFlowInstance = getJoinFlowWrapper(props).instance();
        const responseErr = null;
        const responseBody = [
            {
                msg: 'This field is required.',
                errors: {
                    username: ['This field is required.']
                },
                success: false
            }
        ];
        const responseObj = {
            statusCode: 200
        };
        joinFlowInstance.handleRegistrationResponse(responseErr, responseBody, responseObj);
        expect(joinFlowInstance.props.refreshSession).not.toHaveBeenCalled();
        expect(joinFlowInstance.state.registrationError).toBe('username: This field is required.');
    });

    test('handleRegistrationResponse with failure response, with error fields missing', () => {
        const props = {
            refreshSession: jest.fn()
        };
        const joinFlowInstance = getJoinFlowWrapper(props).instance();
        const responseErr = null;
        const responseBody = [
            {
                msg: 'This field is required.',
                success: false
            }
        ];
        const responseObj = {
            statusCode: 200
        };
        joinFlowInstance.handleRegistrationResponse(responseErr, responseBody, responseObj);
        expect(joinFlowInstance.props.refreshSession).not.toHaveBeenCalled();
        expect(joinFlowInstance.state.registrationError).toBe('This field is required.');
    });

    test('handleRegistrationResponse with failure response, with no text explanation', () => {
        const props = {
            refreshSession: jest.fn()
        };
        const joinFlowInstance = getJoinFlowWrapper(props).instance();
        const responseErr = null;
        const responseBody = [
            {
                success: false
            }
        ];
        const responseObj = {
            statusCode: 200
        };
        joinFlowInstance.handleRegistrationResponse(responseErr, responseBody, responseObj);
        expect(joinFlowInstance.props.refreshSession).not.toHaveBeenCalled();
        expect(joinFlowInstance.state.registrationError).toBe('registration.generalError (200)');
    });

    test('handleRegistrationResponse with failure status code', () => {
        const props = {
            refreshSession: jest.fn()
        };
        const joinFlowInstance = getJoinFlowWrapper(props).instance();
        const responseErr = null;
        const responseBody = [
            {
                success: false
            }
        ];
        const responseObj = {
            statusCode: 400
        };
        joinFlowInstance.handleRegistrationResponse(responseErr, responseBody, responseObj);
        expect(joinFlowInstance.props.refreshSession).not.toHaveBeenCalled();
        expect(joinFlowInstance.state.registrationError).toBe('registration.generalError (400)');
    });

    test('handleRegistrationError with no message ', () => {
        const joinFlowInstance = getJoinFlowWrapper().instance();
        joinFlowInstance.setState({});
        joinFlowInstance.handleRegistrationError();
        expect(joinFlowInstance.state.registrationError).toBe('registration.generalError');
    });

    test('handleRegistrationError with message ', () => {
        const joinFlowInstance = getJoinFlowWrapper().instance();
        joinFlowInstance.setState({});
        joinFlowInstance.handleRegistrationError('my message');
        expect(joinFlowInstance.state.registrationError).toBe('my message');
    });

    test('handleAdvanceStep', () => {
        const joinFlowInstance = getJoinFlowWrapper().instance();
        joinFlowInstance.setState({formData: {username: 'ScratchCat123'}, step: 2});
        joinFlowInstance.handleAdvanceStep({email: 'scratchcat123@scratch.mit.edu'});
        expect(joinFlowInstance.state.formData.username).toBe('ScratchCat123');
        expect(joinFlowInstance.state.formData.email).toBe('scratchcat123@scratch.mit.edu');
        expect(joinFlowInstance.state.step).toBe(3);
    });

    test('when state.registrationError has error message, we show RegistrationErrorStep', () => {
        const joinFlowWrapper = getJoinFlowWrapper();
        joinFlowWrapper.instance().setState({registrationError: 'halp there is a errors!!'});
        const registrationErrorWrapper = joinFlowWrapper.find(RegistrationErrorStep);
        const progressionWrapper = joinFlowWrapper.find(Progression);
        expect(registrationErrorWrapper).toHaveLength(1);
        expect(progressionWrapper).toHaveLength(0);
    });

    test('when state.registrationError has null error message, we show Progression', () => {
        const joinFlowWrapper = getJoinFlowWrapper();
        joinFlowWrapper.instance().setState({registrationError: null});
        const registrationErrorWrapper = joinFlowWrapper.find(RegistrationErrorStep);
        const progressionWrapper = joinFlowWrapper.find(Progression);
        expect(registrationErrorWrapper).toHaveLength(0);
        expect(progressionWrapper).toHaveLength(1);
    });

    test('when state.registrationError has empty error message, we show Progression', () => {
        const joinFlowWrapper = getJoinFlowWrapper();
        joinFlowWrapper.instance().setState({registrationError: ''});
        const registrationErrorWrapper = joinFlowWrapper.find(RegistrationErrorStep);
        const progressionWrapper = joinFlowWrapper.find(Progression);
        expect(registrationErrorWrapper).toHaveLength(0);
        expect(progressionWrapper).toHaveLength(1);
    });

    test('when numAttempts is 0, RegistrationErrorStep receives canTryAgain prop with value true', () => {
        const joinFlowWrapper = getJoinFlowWrapper();
        joinFlowWrapper.instance().setState({
            numAttempts: 0,
            registrationError: 'halp there is a errors!!'
        });
        const registrationErrorWrapper = joinFlowWrapper.find(RegistrationErrorStep);
        expect(registrationErrorWrapper.first().props().canTryAgain).toEqual(true);
    });

    test('when numAttempts is 1, RegistrationErrorStep receives canTryAgain prop with value true', () => {
        const joinFlowWrapper = getJoinFlowWrapper();
        joinFlowWrapper.instance().setState({
            numAttempts: 1,
            registrationError: 'halp there is a errors!!'
        });
        const registrationErrorWrapper = joinFlowWrapper.find(RegistrationErrorStep);
        expect(registrationErrorWrapper.first().props().canTryAgain).toEqual(true);
    });

    test('when numAttempts is 2, RegistrationErrorStep receives canTryAgain prop with value false', () => {
        const joinFlowWrapper = getJoinFlowWrapper();
        joinFlowWrapper.instance().setState({
            numAttempts: 2,
            registrationError: 'halp there is a errors!!'
        });
        const registrationErrorWrapper = joinFlowWrapper.find(RegistrationErrorStep);
        expect(registrationErrorWrapper.first().props().canTryAgain).toEqual(false);
    });

    test('resetState resets entire state, does not leave any state keys out', () => {
        const joinFlowWrapper = getJoinFlowWrapper();
        const joinFlowInstance = joinFlowWrapper.instance();
        Object.keys(joinFlowInstance.state).forEach(key => {
            joinFlowInstance.setState({[key]: 'Different than the initial value'});
        });
        joinFlowInstance.resetState();
        Object.keys(joinFlowInstance.state).forEach(key => {
            expect(joinFlowInstance.state[key]).not.toEqual('Different than the initial value');
        });
    });

    test('resetState makes each state field match initial state', () => {
        const joinFlowWrapper = getJoinFlowWrapper();
        const joinFlowInstance = joinFlowWrapper.instance();
        const stateSnapshot = {};
        Object.keys(joinFlowInstance.state).forEach(key => {
            stateSnapshot[key] = joinFlowInstance.state[key];
        });
        joinFlowInstance.resetState();
        Object.keys(joinFlowInstance.state).forEach(key => {
            expect(stateSnapshot[key]).toEqual(joinFlowInstance.state[key]);
        });
    });

    test('calling resetState results in state.formData which is not same reference as before', () => {
        const joinFlowWrapper = getJoinFlowWrapper();
        const joinFlowInstance = joinFlowWrapper.instance();
        joinFlowInstance.setState({
            formData: defaults({}, {username: 'abcdef'})
        });
        const formDataReference = joinFlowInstance.state.formData;
        joinFlowInstance.resetState();
        expect(formDataReference).not.toBe(joinFlowInstance.state.formData);
        expect(formDataReference).not.toEqual(joinFlowInstance.state.formData);
    });
});
