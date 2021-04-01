package org.keycloak.book.ch13.theme;

import java.io.InputStream;
import java.net.URL;

import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.theme.ThemeResourceProvider;
import org.keycloak.theme.ThemeResourceProviderFactory;

/**
 * <p>A very simple demonstration about how to load custom templates and resources. Helpful if you are implementing other providers,
 * like a authenticator or required action, that requires additional templates and resources.
 *
 * <p>You can use this example as a baseline, but never for production.
 */
public class MyThemeResourceProvider implements ThemeResourceProvider, ThemeResourceProviderFactory {

    private static final String ID = "mythemeselector";
    private final KeycloakSession session;

    public MyThemeResourceProvider() {
        // for reflection when registering the factory
        this(null);
    }

    public MyThemeResourceProvider(KeycloakSession session) {
        this.session = session;
    }

    @Override
    public ThemeResourceProvider create(KeycloakSession session) {
        return new MyThemeResourceProvider(session);
    }

    @Override
    public URL getTemplate(String s) {
        // returns null because we don't have any custom template to load
        return null;
    }

    @Override
    public InputStream getResourceAsStream(String s)  {
        // returns null because we don't have any custom resource to load like css or js
        return null;
    }

    @Override
    public void init(org.keycloak.Config.Scope scope) {
        // first initialization call
    }

    @Override
    public void postInit(KeycloakSessionFactory sessionFactory) {
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
}
