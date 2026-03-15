import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader, Eye, EyeOff, Check, X } from 'lucide-react';
import { updateProfile, changePassword } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  // Form de informações básicas
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Form de trocar senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  // Salvar informações básicas
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setUpdateMessage('Preencha todos os campos');
      return;
    }

    setUpdateLoading(true);
    setUpdateMessage('');

    try {
      const response = await updateProfile(name, email);
      
      if (response.success && response.user) {
        setUser(response.user);
        setUpdateMessage('✓ Perfil atualizado com sucesso!');
        toast({
          title: 'Sucesso',
          description: 'Seus dados foram atualizados',
        });
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        setUpdateMessage('✗ Erro ao atualizar perfil');
      }
    } catch (error: any) {
      setUpdateMessage(`✗ ${error.message || 'Erro ao atualizar perfil'}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Alterar senha
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setPasswordMessage('Preencha todos os campos');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('As senhas não conferem');
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage('');

    try {
      const response = await changePassword(newPassword, confirmPassword);
      
      if (response.success) {
        setNewPassword('');
        setConfirmPassword('');
        setPasswordMessage('✓ Senha alterada com sucesso!');
        toast({
          title: 'Sucesso',
          description: 'Sua senha foi alterada com sucesso',
        });
        setTimeout(() => setPasswordMessage(''), 3000);
      } else {
        setPasswordMessage('✗ Erro ao alterar senha');
      }
    } catch (error: any) {
      setPasswordMessage(`✗ ${error.message || 'Erro ao alterar senha'}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais e segurança</p>
      </div>

      {/* Informações básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>Atualize seus dados pessoais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateLoading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={updateLoading}
              />
            </div>

            {/* Role (somente leitura) */}
            <div className="space-y-2">
              <Label htmlFor="role">Permissões</Label>
              <Input
                id="role"
                type="text"
                value={user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Mensagem */}
            {updateMessage && (
              <div className={`text-sm p-2 rounded flex items-center gap-2 ${
                updateMessage.startsWith('✓')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {updateMessage.startsWith('✓') ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                {updateMessage}
              </div>
            )}

            {/* Botão salvar */}
            <Button
              type="submit"
              disabled={updateLoading}
              className="w-full"
            >
              {updateLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Atualize sua senha de segurança</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Requisitos */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">Requisitos de senha:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Mínimo 6 caracteres</li>
                <li>As senhas devem ser iguais</li>
              </ul>
            </div>

            {/* Mensagem */}
            {passwordMessage && (
              <div className={`text-sm p-2 rounded flex items-center gap-2 ${
                passwordMessage.startsWith('✓')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {passwordMessage.startsWith('✓') ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                {passwordMessage}
              </div>
            )}

            {/* Botão alterar */}
            <Button
              type="submit"
              disabled={passwordLoading}
              className="w-full"
            >
              {passwordLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                'Alterar Senha'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Informações da Conta */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>Detalhes da sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">ID da Conta</p>
            <p className="text-sm font-mono text-foreground">{user?.id}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Conta</p>
            <p className="text-sm font-medium text-foreground capitalize">
              {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
