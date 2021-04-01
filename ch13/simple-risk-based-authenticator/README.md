# Examples for Chapter 13 - Extending Keycloak

## Simple Risk-Based Authenticator

To build this project, execute the following command:

    ./mvnw clean install

Then copy the `target/simple-risk-based-authenticator.jar` to the `$KC_HOME/standalone/deployments` directory.

### What is here

* An example of how to leverage the `Authentication SPI` to create and configure authenticators
* A very simple example of how to use an authenticator to perform risk-based authenticator where the user is forced to use
a second factor depending on the number of failed login attempts