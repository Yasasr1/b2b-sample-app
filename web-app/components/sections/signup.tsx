import React, { useState } from "react";
import {
  Modal,
  Loader,
  Message,
  Button,
  useToaster,
  Heading,
  Text
} from "rsuite";
import AndroidIcon from "@rsuite/icons/Android";
import { Form, Field } from "react-final-form";
import {
  FormButtonToolbar,
  FormField,
} from "@teamspace-app/shared/ui/ui-basic-components";
import FormSuite from "rsuite/Form";
import { getConfig } from "@teamspace-app/util-application-config-util";
import styles from "./signup.module.css";

export const SignUp = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [step1Values,  setStep1Values] = useState({});

  const subscriptionPackages = [
    {
      id: "basic",
      label: "Basic",
      price: 0,
      meetingDuration: "30 min",
      idp: "-",
      personalization: "-",
    },
    {
      id: "business",
      label: "Business",
      price: 5,
      meetingDuration: "60 min",
      idp: "-",
      personalization: "Basic",
    },
    {
      id: "enterprise",
      label: "Enterprise",
      price: 9,
      meetingDuration: "Unlimited",
      idp: "Yes",
      personalization: "Advanced",
    },
  ];

  const subscriptionFeatures = [
    { key: "price", label: "Price" },
    { key: "meetingDuration", label: "Meeting duration" },
    { key: "idp", label: "Plug in your IDP" },
    { key: "personalization", label: "Personalization" },
  ];
  
  const pricingPlans = [
    {
      id: "basic",
      name: "Basic",
      price: 0,
      description: "Perfect for small teams getting started",
      features: [
        "30 min meeting duration",
        "Community support"
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      id: "business",
      name: "Business",
      price: 5,
      period: "/month/user",
      description: "For growing teams that need more power",
      features: [
        "60 min meeting duration",
        "Personalize your app",
        "Dedicated support",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 9,
      period: "/month/user",
      description: "For large organizations with custom needs",
      features: [
        "Unlimited meeting duration",
        "Plug in your IDP",
        "Advanced personalization",
        "Dedicated support"
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  const toaster = useToaster();

  const validatePassword = (value) => {
    if (!value) {
      return "Password is required";
    }

    if (value.length < 8 || value.length > 30) {
      return "Password must be between 8 and 30 characters";
    }

    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter";
    }

    if (!/\d/.test(value)) {
      return "Password must contain at least one digit";
    }

    return undefined;
  };

  const validate = (values: { password?: string; username?: string; email?: string; firstName?: string; lastName?: string; organizationName?: string; orgHandle?: string; subscription?: string }) => {
    const errors: { password?: string; username?: string; email?: string; firstName?: string; lastName?: string; organizationName?: string; orgHandle?: string; subscription?: string } = {};

    if (step === 1) {
      const passwordError = validatePassword(values.password);
      if (passwordError) {
        errors.password = passwordError;
      }
      if (!values.username) {
        errors.username = "Username is required";
      }
      if (!values.email) {
        errors.email = "Email is required";
      }
      if (!values.firstName) {
        errors.firstName = "First name is required";
      }
      if (!values.lastName) {
        errors.lastName = "Last name is required";
      }
      if (!values.organizationName) {
        errors.organizationName = "Organization name is required";
      }
      if (!values.orgHandle) {
        errors.orgHandle = "Organization handle is required";
      }
    }

    if (step === 2 && !values.subscription) {
      errors.subscription = "Subscription is required";
    }

    return errors;
  };

  const handleSignUp = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          email: values.email,
          password: values.password,
          organizationName: values.organizationName,
          orgHandle: values.orgHandle,
          subscription: values.subscription,
          addons: values.addons,
          appName:
            getConfig().BusinessAdminAppConfig.ManagementAPIConfig
              .SharedApplicationName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      toaster.push(
        <Message type="success" closable>
          Sign up successful! Your profile and organization has been created.
        </Message>
      );

      onClose();
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = async (values) => {
    if (step === 1) {
      setStep1Values(values)
      setStep(2);
      return;
    }

    // Merge Step 1 values with Step 2 values
    const mergedValues = { ...step1Values, ...values };
    await handleSignUp(mergedValues);
  };

  return (
    <Modal open={open} onClose={onClose} className={styles.signUpModal} size={step === 2 ? "lg" : "sm"}>
      <Modal.Header className={styles.signUpModalHeader}>
        <Modal.Title>
          <Heading>Create an Account</Heading>
          <Text muted className={styles.signUpModalHeaderDescription}>
            Register for an account to access exclusive features
          </Text>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.signUpModalBody}>
        {error && <Message type="error" className={styles.signUpErrors}>{error}</Message>}
        <Form
          onSubmit={onFormSubmit}
          validate={validate}
          initialValues={{ subscription: 'basic', addons: [] }}
          render={({ handleSubmit, values }) => (
            <FormSuite
              layout="vertical"
              onSubmit={handleSubmit}
              fluid
              style={{ overflow: 'visible' }}
            >
              {step === 1 && (
                <div className={styles.formFields}>
                  <FormField name="username" label="Username" needErrorMessage={true}>
                    <FormSuite.Control name="username" required />
                  </FormField>

                  <FormField name="email" label="Email" needErrorMessage={true}>
                    <FormSuite.Control name="email" required />
                  </FormField>

                  <Field name="password">
                    {({ input, meta }) => (
                      <FormField
                        name="password"
                        label="Password"
                        needErrorMessage={false}
                      >
                        <>
                          <FormSuite.Control
                            {...input}
                            type="password"
                            error={meta.touched && meta.error}
                            errorMessage={meta.touched && meta.error}
                            required
                          />
                          <FormSuite.HelpText>
                            Password must be 8-30 characters with at least one
                            uppercase letter and digit.
                          </FormSuite.HelpText>
                        </>
                      </FormField>
                    )}
                  </Field>

                  <FormField
                    name="firstName"
                    label="First Name"
                    needErrorMessage={true}
                  >
                    <FormSuite.Control name="firstName" required />
                  </FormField>

                  <FormField
                    name="lastName"
                    label="Last Name"
                    needErrorMessage={true}
                  >
                    <FormSuite.Control name="lastName" required />
                  </FormField>

                  <FormField
                    name="organizationName"
                    label="Organization Name"
                    needErrorMessage={true}
                  >
                    <FormSuite.Control name="organizationName" required />
                  </FormField>

                  <FormField
                    name="orgHandle"
                    label="Organization Handle"
                    needErrorMessage={true}
                  >
                    <FormSuite.Control name="orgHandle" required />
                  </FormField>
                </div>
              )}

              {step === 2 && (
                <div className={styles.formFields}>
                  <Field name="subscription" initialValue="basic">
                    {({ input, meta }) => (
                      <div id="pricing" className={styles.pricing}>
                        <div className={styles.container}>
                          <div className={styles.pricingGrid}>
                            {pricingPlans.map((plan, index) => (
                              <div
                                key={index}
                                className={`${styles.pricingCard} ${
                                  input.value === plan.id
                                      ? styles.selected
                                      : ''
                                }`}
                                onClick={() => input.onChange(plan.id)}
                              >
                                <div className={styles.planHeader}>
                                  <h3 className={styles.planName}>
                                    {plan.name}
                                  </h3>
                                  <p className={styles.planDescription}>
                                    {plan.description}
                                  </p>
                                  <div className={styles.planPrice}>
                                    {plan.price === 0 ? (
                                      <span className={styles.price}>
                                        Free
                                      </span>
                                    ) : (
                                      <>
                                        <span className={styles.price}>
                                          {`$${plan.price}`}
                                        </span>
                                        {plan.period && (
                                          <span className={styles.period}>
                                            {plan.period}
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>

                                <ul className={styles.planFeatures}>
                                  {plan.features.map(
                                    (feature, featureIndex) => (
                                      <li
                                        key={featureIndex}
                                        className={styles.planFeature}
                                      >
                                        <span className={styles.checkmark}>
                                          ✓
                                        </span>
                                        {feature}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </Field>
                </div>
              )}

              <div className={styles.buttonToolbarContainer}>
                <FormButtonToolbar
                  block
                  submitButtonText={step === 1 ? 'Next' : 'Sign Up'}
                  submitButtonDisabled={loading}
                  onCancel={onClose}
                />
                {step === 2 && (
                  <Button
                    block
                    type="button"
                    appearance="link"
                    size="lg"
                    onClick={() => setStep(1)}
                  >
                    Go Back
                  </Button>
                )}
              </div>
              {loading && (
                <Loader size="sm" backdrop content="Signing you up!" vertical />
              )}
            </FormSuite>
          )}
        />
      </Modal.Body>
    </Modal>
  );
};
