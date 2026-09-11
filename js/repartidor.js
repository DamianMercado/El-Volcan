function marcarEntregado(boton) {
    const pedido = boton.closest('.pedido');
    const estado = pedido.querySelector('.estado');
    estado.textContent = 'Entregado';
    estado.classList.add('entregado');
    boton.textContent = 'Entregado';
    boton.disabled = true;
}
