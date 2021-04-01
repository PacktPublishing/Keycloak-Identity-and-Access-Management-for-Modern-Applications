# Examples for Chapter 13 - Extending Keycloak

## Themes

To build this project, execute the following command:

    ./mvnw clean install

Then copy the `target/mytheme.jar` to the `$KC_HOME/standalone/deployments` directory.

### What is here

* A custom theme for the login page (only the login page) called `mytheme`.
* An example on how to use a `ThemeSelectorProvider` to dynamically choose a theme.
* An example on how to use a `MyThemeResourceProvider` to load additional templates and resources. 