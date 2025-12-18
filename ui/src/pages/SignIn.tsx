import { useNavigate } from "react-router-dom";
import { GridLayout } from "@progress/kendo-react-layout";
import { Input } from "@progress/kendo-react-inputs";
import { Error } from "@progress/kendo-react-labels";
import {
    Form,
    Field,
    FormElement,
    FormRenderProps,
    FieldWrapper,
    FormValidatorType,
    KeyValue,
    FieldRenderProps,
} from "@progress/kendo-react-form";
import { Button } from "@progress/kendo-react-buttons";
import APIClient from "../services/api-client";
import { useAuthStore, useNotificationStore } from "../store";
import { APP_CONFIG } from "../local";

const usernameLengthMin = 3;
const passwordLengthMin = 3;
const AUTH_ENDPOINT = '/auth/in';
const SEARCH_ENDPOINT = '/v1/search';

interface Credentials {
    username: string;
    password: string;
}

interface SignInResult {
    success: boolean;
}

const SignIn = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const addNotification = useNotificationStore(s => s.addNotification);

    const formValidator: FormValidatorType = (values: any): KeyValue<string> | undefined => {
        let result: KeyValue<string> = {};
        if (values.username && values.username.length < usernameLengthMin) {
            result["username"] = `Please enter a username of at least ${usernameLengthMin} characters.`;
        }
        if (values.password && values.password.length < passwordLengthMin) {
            result["password"] = `Please enter a password of at least ${passwordLengthMin} characters.`;
        }
        return Object.keys(result).length > 0 ? result : undefined;
    };
    
    const validatedInput = ({ validationMessage, visited, ...others }: FieldRenderProps) => {
        return (
            <div>
                <Input {...others} />
                <Error className="error">
                    {visited && validationMessage ? validationMessage : ''}
                </Error>
            </div>
        );
    };

    const signIn = async (credentials: Credentials): Promise<SignInResult> => {
        try {
            const apiClient = new APIClient(AUTH_ENDPOINT);
            const response = await apiClient.put(credentials);
            if (response.status !== 200) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const searchClient = new APIClient(SEARCH_ENDPOINT);
            const response2 = await searchClient.get();
            if (response2.status !== 200) {
                throw new Error(`HTTP error! Status: ${response2.status}`);
            }
            
            setAuth(credentials.username);
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            addNotification({
                style: 'error',
                icon: true,
                closable: true,
                message: `Error signing in: ${errorMessage}`,
                timeout: APP_CONFIG.NOTIFICATION_TIMEOUT_LONG
            });
            return { success: false };
        }
    };

    const handleSubmit = async (dataItem: { [name: string]: any }) => {
        if (!dataItem.username || !dataItem.password) {
            return;
        }
        
        const result = await signIn({ 
            username: dataItem.username, 
            password: dataItem.password 
        });
        
        if (result.success) {
            navigate('/app/search');
        }
    };

    return (
        <>
            <div className="sign-in-page">
                <div className="sign-in-wrapper">
                    <div className="logo-wrapper k-mb-4">
                        <img width={'100%'} src='progress-data-platform.svg' alt={'Progress Data Platform'} /> 
                    </div>
                    <div className="inputs-wrapper k-border k-border-light k-border-solid k-p-4 k-rounded-lg">
                        <h2 className="k-mt-0">
                            Email Audit
                        </h2>
                        <Form
                            onSubmit={handleSubmit}
                            validator={formValidator}
                            render={(formRenderProps: FormRenderProps) => (
                                <FormElement style={{ maxWidth: 650 }}>
                                    <fieldset className={"k-form-fieldset"}>
                                        <div className="k-form-field-wrap">
                                            <Field
                                                name={"username"}
                                                component={validatedInput}
                                                labelClassName={"k-form-label"}
                                                label={"Username"}
                                                required={true}
                                                minLength={usernameLengthMin}
                                                size="26"
                                            />
                                        </div>
                                        <div className="k-form-field-wrap">
                                            <Field
                                                name={"password"}
                                                component={validatedInput}
                                                labelClassName={"k-form-label"}
                                                label={"Password"}
                                                type="password"
                                                required={true}
                                                minLength={passwordLengthMin}
                                                size="26"
                                            />
                                        </div>
                                    </fieldset>
                                    <div className="k-form-buttons" id="signInButtonWrapper">    
                                        <Button
                                            themeColor="base"
                                            type={"submit"}
                                            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
                                            disabled={!formRenderProps.valid}
                                            fillMode={"outline"}
                                            rounded={null}
                                        >
                                            Sign in
                                        </Button>
                                    </div>
                                    {
                                        //signInError && <div className="signInErrorPadding">Error logging in: { signInError }</div>
                                    }
                                    
                                </FormElement>
                            )}
                        />
                    </div>
                </div>    
            </div>
            <div className="second-image-wrapper">
                <img src="data-value.png" alt="product image" height="50%" />
            </div>
            
           
           
        </>
    );
}

export default SignIn;