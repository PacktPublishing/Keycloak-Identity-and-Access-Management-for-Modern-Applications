package org.keycloak.book.ch13.theme;

import javax.ws.rs.core.MultivaluedMap;

import org.keycloak.models.KeycloakContext;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.models.KeycloakUriInfo;
import org.keycloak.theme.DefaultThemeSelectorProvider;
import org.keycloak.theme.Theme;
import org.keycloak.theme.ThemeSelectorProvider;
import org.keycloak.theme.ThemeSelectorProviderFactory;

/**
 * <p>A very simple demonstration about how to customize theme selection at runtime.
 *
 * <p>You can use this example as a baseline, but never for production.
 */
public class MyThemeSelectorProvider extends DefaultThemeSelectorProvider
        implements ThemeSelectorProviderFactory {

    private static final String ID = "mythemeselector";

    private final KeycloakSession session;

    public MyThemeSelectorProvider() {
        // for reflection when registering the factory
        this(null);
    }

    public MyThemeSelectorProvider(KeycloakSession session) {
        super(session);
        this.session = session;
    }

    @Override
    public String getThemeName(Theme.Type type) {
        // an example on how to use a theme selector to choose a team at runtime
        // not targeted for production
        String theme = getThemeParameter();

        if (theme == null || !Theme.Type.LOGIN.equals(type)) {
            return super.getThemeName(type);
        }

        return theme;
    }

    @Override
    public ThemeSelectorProvider create(KeycloakSession session) {
        return new MyThemeSelectorProvider(session);
    }

    @Override
    public void init(org.keycloak.Config.Scope scope) {
        // first initialization call
    }

    @Override
    public void postInit(KeycloakSessionFactory keycloakSessionFactory) {
        // last initialization call, now with access to the session factory
    }

    @Override
    public String getId() {
        return ID;
    }

    @Override
    public void close() {
        // releases any resource you might have created during the initialization phase
    }

    @Override
    public int order() {
        // the order is used to prioritize a provider over others
        // in this case, we are overriding the default theme selector with this implementation
        // another way to configure this provider is changing the server configuration
        return 100;
    }

    private String getThemeParameter() {
        KeycloakContext context = session.getContext();
        KeycloakUriInfo uri = context.getUri();
        MultivaluedMap<String, String> parameters = uri.getQueryParameters();
        return parameters.getFirst("theme");
    }
}
