package org.keycloak.book.ch13.authentication;

import static org.keycloak.book.ch13.authentication.MySimpleRiskBasedAuthenticatorFactory.FAILED_LOGIN_ATTEMPTS_BEFORE_2FA;

import java.util.Collections;
import java.util.Map;

import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.Authenticator;
import org.keycloak.models.AuthenticatorConfigModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserCredentialManager;
import org.keycloak.models.UserLoginFailureModel;
import org.keycloak.models.UserModel;
import org.keycloak.models.UserSessionProvider;
import org.keycloak.models.credential.OTPCredentialModel;

/**
 * @author <a href="mailto:psilva@redhat.com">Pedro Igor</a>
 */
public class MySimpleRiskBasedAuthenticator implements Authenticator {

    private static final String OTP_REQUIRED_USER_ATTRIBUTE = "my.risk.based.auth.2fa.required";

    private enum RiskScore {
        LOW(0),
        MEDIUM(1.0),
        HIGH(2.0);

        private final double score;

        RiskScore(double score) {
            this.score = score;
        }

        public boolean requiresSecondFactor() {
            return score > 0;
        }
    }

    @Override
    public void authenticate(AuthenticationFlowContext context) {
        KeycloakSession session = context.getSession();
        UserModel user = context.getUser();
        RiskScore riskScore = calculateRiskScore(session, context, user);

        if (riskScore.requiresSecondFactor()) {
            forceSecondFactor(session, user);
        } else {
            skipSecondFactor(user);
        }

        context.success();
    }

    private RiskScore calculateRiskScore(KeycloakSession session, AuthenticationFlowContext context, UserModel user) {
        RealmModel realm = session.getContext().getRealm();
        UserSessionProvider sessions = session.sessions();
        UserLoginFailureModel loginFailure = sessions.getUserLoginFailure(realm, user.getId());

        if (loginFailure == null) {
            return RiskScore.LOW;
        }

        int failures = loginFailure.getNumFailures();
        Integer maxFailuresBeforeOtp = getMaxFailuresBeforeOtp(context);

        if (failures >= maxFailuresBeforeOtp) {
            return RiskScore.MEDIUM;
        }

        return RiskScore.LOW;
    }

    private void skipSecondFactor(UserModel user) {
        user.setAttribute(OTP_REQUIRED_USER_ATTRIBUTE, Collections.singletonList("skip"));
    }

    private void forceSecondFactor(KeycloakSession session, UserModel user) {
        UserCredentialManager credentialManager = session.userCredentialManager();
        RealmModel realm = session.getContext().getRealm();

        if (!credentialManager.isConfiguredFor(realm, user, OTPCredentialModel.TYPE)) {
            // if not OTP set, than force registration
            user.addRequiredAction(UserModel.RequiredAction.CONFIGURE_TOTP);
        }

        user.setAttribute(OTP_REQUIRED_USER_ATTRIBUTE, Collections.singletonList("force"));
    }

    private Integer getMaxFailuresBeforeOtp(AuthenticationFlowContext context) {
        Map<String, String> config = Collections.emptyMap();
        AuthenticatorConfigModel configModel = context.getAuthenticatorConfig();

        if (configModel != null) {
            config = configModel.getConfig();
        }

        return Integer.valueOf(config.getOrDefault(FAILED_LOGIN_ATTEMPTS_BEFORE_2FA, "3"));
    }

    @Override
    public void action(AuthenticationFlowContext context) {
        // no-op
    }

    @Override
    public boolean requiresUser() {
        return true;
    }

    @Override
    public boolean configuredFor(KeycloakSession session, RealmModel realm, UserModel user) {
        return true;
    }

    @Override
    public void setRequiredActions(KeycloakSession session, RealmModel realm, UserModel user) {
        // no-op
    }

    @Override
    public void close() {
        // nothing to close
    }
}
