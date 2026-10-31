package com.elvolcan.enums;

public enum Rol {
    ADMIN("ADMINISTRADOR"),
    CLIENTE("CLIENTE"),
    REPARTIDOR("REPARTIDOR"),
    OPERADOR("OPERADOR");

    private final String valor;

    Rol(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static Rol fromValor(String valor) {

        for (Rol r : values()) {

            if (r.valor.equalsIgnoreCase(valor)) {
                return r;
            }
        }

        throw new IllegalArgumentException(
                "Rol de usuario desconocido: " + valor
        );
    }
}

