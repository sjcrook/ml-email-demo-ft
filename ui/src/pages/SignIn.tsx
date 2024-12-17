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

const SignIn = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const addNotification = useNotificationStore(s => s.addNotification);

    const formValidator: FormValidatorType = (values: any): KeyValue<string> | undefined =>  {
        let result: KeyValue<string> = {};
        if (values.username && values.username.length < usernameLengthMin) {
            result["username"] = "Please enter a username of at least " + usernameLengthMin + " characters.";
        }
        if (values.password && values.password.length < passwordLengthMin) {
            result["password"] = "Please enter a password of at least " + passwordLengthMin + " characters.";
        }
        if (Object.keys(result).length > 0) {
            return result;
        } else {
            return;
        }
    };
    
    const validatedInput = ({ validationMessage, visited, ...others }: FieldRenderProps) => {
        return (
            <div>
                <Input {...others} />
                {
                    /*visited && validationMessage && <Error>{validationMessage}</Error>*/
                    <Error className="error">{visited && validationMessage && validationMessage }</Error>
                }
            </div>
        );
    };

    const signIn = async (credentials) => {
        try {
            const apiClient = new APIClient('/auth/in');
            const response = await apiClient.put(credentials);
            if (response.status !== 200) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const apiClient2 = new APIClient('/v1/search');
            const response2 = await apiClient2.get();
            if (response2.status !== 200) {
                throw new Error(`HTTP error! Status: ${response2.status}`);
            }
            setAuth(credentials.username);
            return { success: true };
        } catch (error) {
            addNotification({
                style: 'error',
                icon: true,
                closable: true,
                message: "Error signing in: " + error.message,
                timeout: APP_CONFIG.NOTIFICATION_TIMEOUT_LONG
            });
            return { success: false };
        }
    };

    const handleSubmit = (dataItem: { [name: string]: any }) => {
        signIn({ username: dataItem.username, password: dataItem.password })
            .then(result => {
                if (result.success) {
                    navigate('/app/search');
                }
            });
    };

    return (
        <>
            <div>
                <GridLayout
                    className="signInLayout"
                    align={{ horizontal: 'center', vertical: 'middle' }}
                >
                    <Form
                        onSubmit={handleSubmit}
                        validator={formValidator}
                        render={(formRenderProps: FormRenderProps) => (
                            <FormElement style={{ maxWidth: 650 }}>
                                <fieldset className={"k-form-fieldset"}>
                                    <FieldWrapper>
                                        <div className="k-form-field-wrap">
                                            <Field
                                                name={"username"}
                                                component={validatedInput}
                                                labelClassName={"k-form-label"}
                                                label={"Username"}
                                                required={true}
                                                minLength={usernameLengthMin}
                                                size="25"
                                            />
                                        </div>
                                    </FieldWrapper>
                                    <FieldWrapper>
                                        <div className="k-form-field-wrap">
                                            <Field
                                                name={"password"}
                                                component={validatedInput}
                                                labelClassName={"k-form-label"}
                                                label={"Password"}
                                                type="password"
                                                required={true}
                                                minLength={passwordLengthMin}
                                                size="25"
                                            />
                                        </div>
                                    </FieldWrapper>
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
                                <style>{`
                                    #signInButtonWrapper {
                                        padding-top: 0px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                    }

                                    .signInErrorPadding {
                                        margin-top: 20px;
                                    }

                                    .error {
                                        height: 17.15px;
                                    }
                                `}</style>
                            </FormElement>
                        )}
                    />
                </GridLayout>
            </div>
            <style>{`
                .signInLayout {
                    height: 300px;
                }
            `}</style>
        </>
    );
}

export default SignIn;