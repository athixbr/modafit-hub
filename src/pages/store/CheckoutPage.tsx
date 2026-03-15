import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { createStoreOrder } from '@/lib/api';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, ShoppingBag, User, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount } = useCart();
  const { isAuthenticated, customer, token } = useStoreAuth();
  
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFinishOrder = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login necessário',
        description: 'Faça login para finalizar o pedido',
        variant: 'destructive'
      });
      navigate('/loja/login');
      return;
    }

    if (cart.length === 0) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione produtos ao carrinho',
        variant: 'destructive'
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: 'Método de pagamento',
        description: 'Selecione a forma de pagamento',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      if (!token) throw new Error('Token não encontrado');

      const response = await createStoreOrder(token, {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color
        })),
        paymentMethod,
        totalAmount: getCartTotal(),
        notes
      });

      if (response.success) {
        toast({
          title: 'Pedido realizado!',
          description: 'Em breve entraremos em contato para confirmar sua compra.',
        });
        clearCart();
        navigate('/loja');
      } else {
        throw new Error(response.message || 'Erro ao criar pedido');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao finalizar pedido',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">Adicione produtos para continuar</p>
          <Link to="/loja">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              Continuar Comprando
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/loja" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar para loja
          </Link>
          <h1 className="text-3xl font-bold">Carrinho de Compras</h1>
          <p className="text-gray-600">{getCartCount()} {getCartCount() === 1 ? 'item' : 'itens'} no carrinho</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <Card key={`${item.productId}-${item.size}-${index}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span>Tamanho: {item.size}</span>
                        {item.color && <span>Cor: {item.color}</span>}
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.productId, item.size)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatCurrency(item.price * item.quantity)}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(item.price)} cada</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="space-y-4">
            {/* Customer Info */}
            {isAuthenticated && customer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Seus Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Nome:</span>
                    <p className="font-medium">{customer.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Telefone:</span>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                  {customer.address && (
                    <div>
                      <span className="text-gray-600">Endereço:</span>
                      <p className="font-medium">{customer.address}</p>
                    </div>
                  )}
                  {customer.city && (
                    <div>
                      <span className="text-gray-600">Cidade:</span>
                      <p className="font-medium">{customer.city}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                    <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma observação sobre o pedido?"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({getCartCount()} itens)</span>
                  <span className="font-medium">{formatCurrency(getCartTotal())}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">{formatCurrency(getCartTotal())}</span>
                  </div>
                </div>
                
                {!isAuthenticated ? (
                  <div className="space-y-2 pt-3">
                    <Link to="/loja/login">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                        Fazer Login para Finalizar
                      </Button>
                    </Link>
                    <Link to="/loja/cadastro">
                      <Button variant="outline" className="w-full">
                        Criar Conta
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Button
                    onClick={handleFinishOrder}
                    disabled={loading || !paymentMethod}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {loading ? 'Finalizando...' : 'Finalizar Pedido'}
                  </Button>
                )}

                <p className="text-xs text-gray-500 text-center">
                  Após finalizar, entraremos em contato para confirmar sua compra
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
