import { formatearPesos } from '../../utils/formato.js'

const describirMetodoPago = (pedido) => {
  const metodo = String(pedido?.metodoPago || '').toLowerCase()
  const sub = String(pedido?.subMetodoPago || '').toLowerCase()

  if (metodo === 'pagar_ahora' || sub.includes('webpay')) {
    const detalleSub = sub || 'webpay'
    return `Pago en Línea (Webpay) (${detalleSub})`
  }
  if (metodo === 'repartidor') {
    const detalleSub = sub === 'tarjeta' ? 'tarjeta' : 'efectivo'
    return `Pago al Repartidor (${detalleSub})`
  }
  return metodo ? `Pago (${metodo})` : 'Pago al Repartidor (efectivo)'
}

export function DetallePedidoSeguimiento({ pedido }) {
  if (!pedido) return null

  const items = Array.isArray(pedido.items) ? pedido.items : []
  const esPagado = String(pedido.estadoPago || '').toLowerCase() === 'pagado'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="m-0 text-base font-extrabold text-[#0A2540]">
        Detalle del Pedido
      </h2>

      <div className="mt-4 flex flex-col gap-2.5">
        {items.length > 0 ? (
          items.map((item, idx) => {
            const nombre = item.producto?.nombre || 'Producto El Volcán'
            const cantidad = Number(item.cantidad ?? 1)
            const subtotal =
              Number(item.subtotal) ||
              Number(item.producto?.precio ?? 0) * cantidad

            return (
              <div
                key={`${item.producto?.codigo || nombre}-${idx}`}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <span className="text-slate-600">
                  <strong className="font-bold text-[#0A2540]">
                    {cantidad}x
                  </strong>{' '}
                  {nombre}
                </span>
                <span className="shrink-0 font-semibold text-[#0A2540]">
                  {formatearPesos(subtotal)}
                </span>
              </div>
            )
          })
        ) : (
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="text-slate-600">
              {pedido.detalle || 'Pedido de gas licuado'}
            </span>
            <span className="shrink-0 font-semibold text-[#0A2540]">
              {formatearPesos(pedido.total)}
            </span>
          </div>
        )}
      </div>

      <div className="my-4 border-t border-slate-100" />

      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-bold uppercase tracking-wide text-slate-500">
          TOTAL:
        </span>
        <strong className="text-2xl font-extrabold text-[#0A2540]">
          {formatearPesos(pedido.total)}
        </strong>
      </div>

      <p className="m-0 mt-2.5 text-xs text-slate-500">
        Método: {describirMetodoPago(pedido)} •{' '}
        <strong
          className={
            esPagado
              ? 'font-bold text-emerald-600'
              : 'font-bold text-amber-600'
          }
        >
          {esPagado ? 'Pagado' : 'Pendiente'}
        </strong>
      </p>
    </section>
  )
}

export default DetallePedidoSeguimiento
