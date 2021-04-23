package org.keycloak.book.ch13.authentication;

import static org.keycloak.provider.ProviderConfigProperty.STRING_TYPE;

import java.util.Collections;
import java.util.List;

import org.apache.http.auth.AUTH;
import org.keycloak.Config;
import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.AuthenticatorFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;

/**
 * <p>A very simple demonstration about how to extend the <b>Authentication SPI</b> to create custom authentication execution
 * by using a custom {@link Authenticator} type.
 *
 * <p>This authentication execution should be used in Browser-like flow and added right after the <i>Username Password Form</i>
 * execution.
 *
 * <p>This authenticator is responsible for deciding whether 2FA is mandatory for a user depending on the number of falied login
 * attempts.
 *
 * <p>By setting the {@code failedLoginAttemptsBefore2FA} configuration property for this authenticator, you can define
 * the maximum number of failures until 2FA is mandatory to authenticate users. The default value is {@code 3}.
 */
public class MySimpleRiskBasedAuthenticatorFactory implements AuthenticatorFactory {

    public static final String ID = "myriskbasedauthenticator";

    // the authenticator does not keep any state and rely on runtime information. Can be safely shared across multiple threads
    private static final Authenticator AUTHENTICATOR_INSTANCE = new MySimpleRiskBasedAuthenticator();
    static final String FAILED_LOGIN_ATTEMPTS_BEFORE_2FA = "failedLoginAttemptsBefore2FA";

    @Override
    public Authenticator create(KeycloakSession keycloakSession) {
        // no need to create an instance all the time, so we just use a singleton
        return AUTHENTICATOR_INSTANCE;
    }

    @Override
    public String getDisplayType() {
        return "My Simple Risk-Based Authenticator";
    }

    @Override
    public boolean isConfigurable() {
        return true;
    }

    @Override
    public AuthenticationExecutionModel.Requirement[] getRequirementChoices() {
        return new AuthenticationExecutionModel.Requirement[] { AuthenticationExecutionModel.Requirement.REQUIRED };
    }

    @Override
    public boolean isUserSetupAllowed() {
        return false;
    }

    @Override
    public String getHelpText() {
        return "A help test";
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        ProviderConfigProperty name = new ProviderConfigProperty();

        // by configuring this property, you should be able to configure this authenticator in the administration console
        name.setType(STRING_TYPE);
        name.setName(FAILED_LOGIN_ATTEMPTS_BEFORE_2FA);
        name.setLabel("Failed attempts before asking second factor");
        name.setHelpText("The number of failed attempts before asking second factor");

        return Collections.singletonList(name);
    }

    @Override
    public String getReferenceCategory() {
        return null;
    }

    @Override
    public void init(Config.Scope scope) {
        // no supported configuration, nothing to initialize
    }

    @Override
    public void postInit(KeycloakSessionFactory keycloakSessionFactory) {
        // nothing to initialize
    }

    @Override
    public void close() {
        // nothing to close
    }

    @Override
    public String getId() {
        return ID;
    }
}
