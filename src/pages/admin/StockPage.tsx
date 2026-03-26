import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, Package, UploadCloud, TrendingUp, TrendingDown, BarChart3, Settings, ImageIcon, List, LayoutGrid, Tag, Power, PowerOff, X, History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories, getSizes, getColors,
  createCategory, createSize, createColor,
  deleteCategory, deleteSize, deleteColor,
  updateCategory, updateSize, updateColor,
  uploadFile, createStockEntry, createStockExit, createStockAdjustment, getProductMovements
} from '@/lib/api';

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  notes?: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string | string[];
  size?: string[];
  color?: string;
  price: number;
  costPrice: number;
  quantity: number;
  minStock: number;
  sku: string;
  image?: string;
  images?: string[];
  active: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
}

interface Size {
  id: string;
  name: string;
  order: number;
  active?: boolean;
}

interface Color {
  id: string;
  name: string;
  hexCode?: string;
  active?: boolean;
}

interface InvoiceItem {
  code?: string;
  ean?: string;
  description?: string;
  ncm?: string;
  cfop?: string;
  unit?: string;
  quantity?: string;
  unitPrice?: string;
  total?: string;
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showXmlImport, setShowXmlImport] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [parsedItems, setParsedItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showBulkCategoryDialog, setShowBulkCategoryDialog] = useState(false);
  const [bulkCategoryValue, setBulkCategoryValue] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockTab, setStockTab] = useState<'entry' | 'exit' | 'adjust' | 'history'>('entry');
  const [stockQty, setStockQty] = useState('');
  const [stockNotes, setStockNotes] = useState('');
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const { toast } = useToast();
  
  // Refs
  const xmlInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadProducts();
    loadAttributes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCategory = (c: string | string[] | undefined) => {
    if (!c) return '';
    return Array.isArray(c) ? c.join(', ') : c;
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      if (response.success) {
        setProducts((response.data as Product[]) || []);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAttributes = async () => {
    try {
      const [categoriesRes, sizesRes, colorsRes] = await Promise.all([
        getCategories(),
        getSizes(),
        getColors()
      ]);

      if (categoriesRes.success) setCategories((categoriesRes.data as Category[]) || []);
      if (sizesRes.success) setSizes((sizesRes.data as Size[]) || []);
      if (colorsRes.success) setColors((colorsRes.data as Color[]) || []);
    } catch (error) {
      console.error('Erro ao carregar atributos:', error);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    formatCategory(p.category).toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every(p => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Deseja deletar ${selectedIds.size} produto(s) selecionado(s)? Esta ação não pode ser desfeita.`)) return;
    try {
      await Promise.all([...selectedIds].map(id => deleteProduct(id)));
      toast({ title: 'Sucesso', description: `${selectedIds.size} produto(s) deletado(s)`, className: 'bg-green-600 text-white border-0' });
      setSelectedIds(new Set());
      loadProducts();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao deletar produtos selecionados', variant: 'destructive' });
    }
  };

  const handleBulkSetActive = async (active: boolean) => {
    try {
      await Promise.all([...selectedIds].map(id => updateProduct(id, { active })));
      toast({ title: 'Sucesso', description: `${selectedIds.size} produto(s) ${active ? 'ativado(s)' : 'desativado(s)'}`, className: 'bg-green-600 text-white border-0' });
      setSelectedIds(new Set());
      loadProducts();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao atualizar produtos', variant: 'destructive' });
    }
  };

  const handleBulkChangeCategory = async () => {
    if (!bulkCategoryValue) return;
    try {
      await Promise.all([...selectedIds].map(id => updateProduct(id, { category: bulkCategoryValue })));
      toast({ title: 'Sucesso', description: `Categoria atualizada em ${selectedIds.size} produto(s)`, className: 'bg-green-600 text-white border-0' });
      setSelectedIds(new Set());
      setShowBulkCategoryDialog(false);
      setBulkCategoryValue('');
      loadProducts();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao alterar categoria em massa', variant: 'destructive' });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openStockModal = async (product: Product) => {
    setStockModalProduct(product);
    setStockTab('entry');
    setStockQty('');
    setStockNotes('');
    setStockMovements([]);
    setShowStockModal(true);
    setLoadingMovements(true);
    try {
      const res = await getProductMovements(product.id);
      if (res.success) setStockMovements(res.data as StockMovement[]);
    } catch {/* silent */} finally {
      setLoadingMovements(false);
    }
  };

  const handleStockAction = async () => {
    if (!stockModalProduct || !stockQty || Number(stockQty) <= 0) {
      toast({ title: 'Informe uma quantidade válida', variant: 'destructive' });
      return;
    }
    try {
      let res;
      if (stockTab === 'entry') {
        res = await createStockEntry({ items: [{ productId: stockModalProduct.id, quantity: Number(stockQty) }], notes: stockNotes });
      } else if (stockTab === 'exit') {
        res = await createStockExit({ productId: stockModalProduct.id, quantity: Number(stockQty), notes: stockNotes });
      } else {
        res = await createStockAdjustment({ productId: stockModalProduct.id, newQuantity: Number(stockQty), notes: stockNotes });
      }
      if (res.success) {
        toast({ title: 'Movimentação registrada!', className: 'bg-green-600 text-white border-0' });
        setStockQty('');
        setStockNotes('');
        await loadProducts();
        const mvRes = await getProductMovements(stockModalProduct.id);
        if (mvRes.success) setStockMovements(mvRes.data as StockMovement[]);
      } else {
        toast({ title: 'Erro', description: res.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Erro ao registrar movimentação', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente deletar este produto?')) return;

    try {
      const response = await deleteProduct(id);
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Produto deletado',
          className: 'bg-green-600 text-white border-0'
        });
        loadProducts();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao deletar produto',
        variant: 'destructive'
      });
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    try {
      // Upload da imagem se houver
      let imageUrl = editingProduct?.image || '';
      if (selectedImage) {
        setUploadingImage(true);
        const uploadResponse = await uploadFile(selectedImage, 'products');
        if (uploadResponse.success) {
          imageUrl = uploadResponse.url;
        }
        setUploadingImage(false);
      }

      // Selecionar tamanhos marcados
      const selectedSizes: string[] = [];
      sizes.forEach(size => {
        if (form.get(`size_${size.id}`) === 'on') {
          selectedSizes.push(size.name);
        }
      });

      const selectedCategories = form.getAll('category') as string[];

      const productData = {
        name: form.get('name') as string,
        description: form.get('description') as string,
        category: selectedCategories,
        size: selectedSizes,
        color: form.get('color') as string,
        price: parseFloat(form.get('price') as string),
        costPrice: parseFloat(form.get('costPrice') as string),
        quantity: parseInt(form.get('quantity') as string),
        minStock: parseInt(form.get('minStock') as string),
        sku: form.get('sku') as string,
        image: imageUrl,
        active: true
      };

      const response = editingProduct 
        ? await updateProduct(editingProduct.id, productData)
        : await createProduct(productData);

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: response.message,
          className: 'bg-green-600 text-white border-0'
        });
        setShowForm(false);
        setEditingProduct(null);
        setImagePreview('');
        setSelectedImage(null);
        loadProducts();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar produto',
        variant: 'destructive'
      });
    }
  };

  const parseXml = (xmlText: string): InvoiceItem[] => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'application/xml');
      const dets = Array.from(doc.getElementsByTagNameNS('*', 'det'));
      if (dets.length === 0) {
        const dets2 = Array.from(doc.getElementsByTagName('det'));
        return dets2.map(det => extractFromDet(det));
      }
      return dets.map(det => extractFromDet(det));
    } catch (err) {
      console.error('XML parse error', err);
      return [];
    }
  };

  const extractFromDet = (det: Element): InvoiceItem => {
    const prod = Array.from(det.children).find(c => c.localName === 'prod');
    if (!prod) return {};
    const get = (name: string) => {
      const el = prod.querySelector(name) || prod.querySelector(`[local-name()="${name}"]` as string);
      if (el) return el.textContent || undefined;
      const found = Array.from(prod.children).find(c => c.localName?.toLowerCase() === name.toLowerCase());
      return found?.textContent || undefined;
    };

    return {
      code: get('cProd'),
      ean: get('cEAN'),
      description: get('xProd'),
      ncm: get('NCM'),
      cfop: get('CFOP'),
      unit: get('uCom'),
      quantity: get('qCom'),
      unitPrice: get('vUnCom'),
      total: get('vProd')
    };
  };

  const handleXmlFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const items = parseXml(text);
      setParsedItems(items);
      toast({ title: 'Arquivo lido', description: `${items.length} itens encontrados` });
    };
    reader.onerror = () => {
      toast({ title: 'Erro', description: 'Não foi possível ler o arquivo', variant: 'destructive' });
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleImportEntry = async () => {
    if (parsedItems.length === 0) {
      toast({ title: 'Nada para importar', description: 'Carregue um XML primeiro', variant: 'destructive' });
      return;
    }

    try {
      const entries = parsedItems.map(item => ({
        productCode: item.code,
        productEan: item.ean,
        productDescription: item.description,
        productNcm: item.ncm,
        productCfop: item.cfop,
        productUnit: item.unit,
        quantity: parseInt(item.quantity || '0'),
        unitPrice: parseFloat(item.unitPrice || '0'),
        totalPrice: parseFloat(item.total || '0')
      }));

      const response = await createStockEntry({
        items: entries,
        notes: 'Importação via XML NF-e'
      });

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: response.message,
          className: 'bg-green-600 text-white border-0'
        });
        setParsedItems([]);
        setShowXmlImport(false);
        loadProducts();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao importar entradas',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Estoque</h1>
          <p className="text-muted-foreground">{products.length} produtos cadastrados</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAttributes(true)} variant="outline" className="gap-2">
            <Settings className="h-4 w-4" /> Gerenciar Atributos
          </Button>
          <Button onClick={() => setShowXmlImport(true)} variant="outline" className="gap-2">
            <TrendingUp className="h-4 w-4" /> Entrada (XML)
          </Button>
          <Button onClick={() => { setEditingProduct(null); setImagePreview(''); setSelectedImage(null); setShowForm(true); }} className="gradient-primary text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> Novo Produto
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, SKU ou categoria..." value={search} onChange={e => { setSearch(e.target.value); setSelectedIds(new Set()); }} className="pl-10" />
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button onClick={() => setViewMode('table')} className={`px-3 py-2 transition-colors ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`} title="Visualização em tabela">
            <List className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode('grid')} className={`px-3 py-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`} title="Visualização em grade">
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
        {someSelected && (
          <span className="text-sm text-muted-foreground">{selectedIds.size} de {filtered.length} selecionado(s)</span>
        )}
      </div>

      {viewMode === 'table' ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="w-10 py-3 px-4">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded border-gray-300 cursor-pointer" />
                </th>
                <th className="py-3 px-4 text-left font-medium text-muted-foreground">Produto</th>
                <th className="py-3 px-4 text-left font-medium text-muted-foreground hidden md:table-cell">SKU</th>
                <th className="py-3 px-4 text-left font-medium text-muted-foreground hidden lg:table-cell">Categoria</th>
                <th className="py-3 px-4 text-left font-medium text-muted-foreground">Tamanhos</th>
                <th className="py-3 px-4 text-right font-medium text-muted-foreground hidden lg:table-cell">Custo</th>
                <th className="py-3 px-4 text-right font-medium text-muted-foreground">Venda</th>
                <th className="py-3 px-4 text-right font-medium text-muted-foreground">Estoque</th>
                <th className="py-3 px-4 text-center font-medium text-muted-foreground hidden md:table-cell">Status</th>
                <th className="py-3 px-4 text-center font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${selectedIds.has(product.id) ? 'bg-primary/5' : ''}`}>
                  <td className="py-3 px-4">
                    <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelectOne(product.id)} className="rounded border-gray-300 cursor-pointer" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate max-w-[220px]">{product.name}</p>
                        {product.color && <p className="text-xs text-muted-foreground">{product.color}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground hidden md:table-cell">{product.sku}</td>
                  <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{formatCategory(product.category)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {(product.size || []).map((s: string) => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground hidden lg:table-cell">R$ {Number(product.costPrice).toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-primary">R$ {Number(product.price).toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${product.quantity <= product.minStock ? 'text-destructive' : 'text-foreground'}`}>{product.quantity}</span>
                    <span className="text-xs text-muted-foreground ml-1">un.</span>
                  </td>
                  <td className="py-3 px-4 text-center hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                      {product.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setEditingProduct(product); setImagePreview(product.image || ''); setSelectedImage(null); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Editar">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => openStockModal(product)} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="Gerenciar Estoque">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Deletar">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div key={product.id} className={`bg-card rounded-xl border shadow-card overflow-hidden group hover:shadow-lg transition-shadow ${selectedIds.has(product.id) ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
              <div className="aspect-square relative overflow-hidden bg-muted">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelectOne(product.id)} className="w-4 h-4 rounded cursor-pointer" />
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => openStockModal(product)} className="p-1.5 rounded-lg bg-card/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors" title="Gerenciar Estoque">
                    <BarChart3 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { setEditingProduct(product); setImagePreview(product.image || ''); setSelectedImage(null); setShowForm(true); }} className="p-1.5 rounded-lg bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
                    <Edit className="h-3.5 w-3.5 text-foreground" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg bg-card/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {product.quantity <= product.minStock && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-destructive/90 text-destructive-foreground text-xs font-medium">
                    Estoque baixo
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{product.sku} • {formatCategory(product.category)}</p>
                <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-primary">R$ {Number(product.price).toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">{product.quantity} un.</span>
                </div>
                {product.size && product.size.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {product.size.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      )}

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Upload de Imagem */}
              <div className="col-span-2 space-y-2">
                <Label>Imagem do Produto</Label>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-border" />
                    ) : (
                      <div className="w-32 h-32 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageSelect}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">Formatos aceitos: JPG, PNG, WEBP. Tamanho máximo: 5MB</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-1">
                <Label>Nome *</Label>
                <Input name="name" required defaultValue={editingProduct?.name} />
              </div>
              
              <div className="col-span-2 space-y-1">
                <Label>Descrição</Label>
                <textarea name="description" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none h-20" defaultValue={editingProduct?.description} />
              </div>
              
              <div className="space-y-1">
                <Label>Categorias *</Label>
                <select name="category" required multiple defaultValue={
                  editingProduct?.category
                    ? Array.isArray(editingProduct.category)
                      ? editingProduct.category
                      : [editingProduct.category]
                    : []
                } className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" size={4}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1">
                <Label>Cor *</Label>
                <select name="color" required defaultValue={editingProduct?.color} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Selecione...</option>
                  {colors.map(color => (
                    <option key={color.id} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Tamanhos *</Label>
                <div className="flex flex-wrap gap-3">
                  {sizes.map(size => (
                    <label key={size.id} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name={`size_${size.id}`}
                        defaultChecked={editingProduct?.size?.includes(size.name)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{size.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1">
                <Label>SKU *</Label>
                <Input name="sku" required defaultValue={editingProduct?.sku} />
              </div>
              
              <div className="space-y-1">
                <Label>Estoque Mínimo *</Label>
                <Input name="minStock" type="number" required defaultValue={editingProduct?.minStock} />
              </div>
              
              <div className="space-y-1">
                <Label>Quantidade *</Label>
                <Input name="quantity" type="number" required defaultValue={editingProduct?.quantity} />
              </div>
              
              <div className="space-y-1">
                <Label>Preço Custo *</Label>
                <Input name="costPrice" type="number" step="0.01" required defaultValue={editingProduct?.costPrice} />
              </div>
              
              <div className="space-y-1">
                <Label>Preço Venda *</Label>
                <Input name="price" type="number" step="0.01" required defaultValue={editingProduct?.price} />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={uploadingImage} className="gradient-primary text-primary-foreground">
                {uploadingImage ? 'Enviando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Attributes Management Dialog */}
      <AttributesDialog 
        open={showAttributes}
        onClose={() => setShowAttributes(false)}
        categories={categories}
        sizes={sizes}
        colors={colors}
        onReload={loadAttributes}
        toast={toast}
      />

      {/* XML Import Dialog */}
      <Dialog open={showXmlImport} onOpenChange={setShowXmlImport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Entrada de Estoque via XML NF-e</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3">
              <input 
                ref={xmlInputRef}
                type="file" 
                accept=".xml,application/xml" 
                onChange={e => handleXmlFile(e.target.files ? e.target.files[0] : null)} 
                className="hidden" 
              />
              <Button 
                type="button" 
                onClick={() => xmlInputRef.current?.click()}
                className="flex-1 gap-2"
              >
                <UploadCloud className="h-4 w-4" /> Selecionar XML
              </Button>
              <Button onClick={handleImportEntry} disabled={parsedItems.length === 0} className="gap-2 gradient-primary">
                <TrendingUp className="h-4 w-4" /> Lançar Entrada
              </Button>
            </div>

            {parsedItems.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium">{parsedItems.length} itens encontrados no XML</p>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/30 border-b border-border">
                      <tr>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Código</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Descrição</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">NCM</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Un</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">Qtd</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">V. Unit</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="py-2 px-3 text-foreground">{item.code || '-'}</td>
                          <td className="py-2 px-3 text-foreground max-w-[200px] truncate">{item.description || '-'}</td>
                          <td className="py-2 px-3 text-foreground">{item.ncm || '-'}</td>
                          <td className="py-2 px-3 text-foreground">{item.unit || '-'}</td>
                          <td className="py-2 px-3 text-right">{item.quantity || '-'}</td>
                          <td className="py-2 px-3 text-right">R$ {item.unitPrice || '-'}</td>
                          <td className="py-2 px-3 text-right">R$ {item.total || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Management Modal */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Package className="h-5 w-5" />
              Estoque — {stockModalProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {[{ key: 'entry', label: 'Entrada', icon: TrendingUp }, { key: 'exit', label: 'Saída', icon: TrendingDown }, { key: 'adjust', label: 'Ajuste', icon: BarChart3 }, { key: 'history', label: 'Histórico', icon: History }].map(t => (
                <button
                  key={t.key}
                  onClick={() => setStockTab(t.key as typeof stockTab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    stockTab === t.key ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              ))}
            </div>

            {stockTab !== 'history' ? (
              <div className="space-y-3">
                <div className="bg-muted/40 rounded-lg px-4 py-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estoque atual</span>
                  <span className="text-lg font-bold text-foreground">{stockModalProduct?.quantity ?? 0} un.</span>
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">
                    {stockTab === 'adjust' ? 'Nova quantidade total' : 'Quantidade'}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={stockQty}
                    onChange={e => setStockQty(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Observações (opcional)</Label>
                  <Input
                    placeholder="Ex: Entrada NF #1234"
                    value={stockNotes}
                    onChange={e => setStockNotes(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowStockModal(false)}>Cancelar</Button>
                  <Button onClick={handleStockAction} className="gradient-primary text-primary-foreground">
                    {stockTab === 'entry' ? 'Lançar Entrada' : stockTab === 'exit' ? 'Lançar Saída' : 'Ajustar Estoque'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {loadingMovements ? (
                  <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" /></div>
                ) : stockMovements.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma movimentação registrada.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="text-left border-b border-border">
                        <th className="py-2 pr-3 text-muted-foreground font-medium">Tipo</th>
                        <th className="py-2 pr-3 text-right text-muted-foreground font-medium">Qtd</th>
                        <th className="py-2 pr-3 text-muted-foreground font-medium">Observação</th>
                        <th className="py-2 text-muted-foreground font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockMovements.map(m => (
                        <tr key={m.id} className="border-b border-border/40">
                          <td className="py-2 pr-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              m.type === 'entry' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : m.type === 'exit' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>{m.type === 'entry' ? 'Entrada' : m.type === 'exit' ? 'Saída' : 'Ajuste'}</span>
                          </td>
                          <td className="py-2 pr-3 text-right font-semibold">{m.quantity}</td>
                          <td className="py-2 pr-3 text-muted-foreground max-w-[120px] truncate">{m.notes || '-'}</td>
                          <td className="py-2 text-muted-foreground">{new Date(m.createdAt).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Barra flutuante de Ações em Massa */}
      {someSelected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-card border border-border rounded-2xl shadow-2xl px-5 py-3">
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">{selectedIds.size} selecionado(s)</span>
          <div className="w-px h-5 bg-border mx-1" />
          <Button size="sm" variant="outline" onClick={() => handleBulkSetActive(true)} className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950/30">
            <Power className="h-3.5 w-3.5" /> Ativar
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkSetActive(false)} className="gap-1.5 text-orange-500 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/30">
            <PowerOff className="h-3.5 w-3.5" /> Desativar
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowBulkCategoryDialog(true)} className="gap-1.5">
            <Tag className="h-3.5 w-3.5" /> Categoria
          </Button>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="gap-1.5">
            <Trash2 className="h-3.5 w-3.5" /> Excluir
          </Button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Limpar seleção">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Dialog: Alterar Categoria em Massa */}
      <Dialog open={showBulkCategoryDialog} onOpenChange={setShowBulkCategoryDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar Categoria em Massa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">{selectedIds.size} produto(s) selecionado(s) serão atualizados.</p>
            <div className="space-y-1">
              <Label>Nova Categoria</Label>
              <select value={bulkCategoryValue} onChange={e => setBulkCategoryValue(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Selecione...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowBulkCategoryDialog(false); setBulkCategoryValue(''); }}>Cancelar</Button>
              <Button onClick={handleBulkChangeCategory} disabled={!bulkCategoryValue} className="gradient-primary text-primary-foreground">Aplicar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de Gerenciamento de Atributos
interface AttributesDialogProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  sizes: Size[];
  colors: Color[];
  onReload: () => void;
  toast: ReturnType<typeof useToast>['toast'];
}

function AttributesDialog({ open, onClose, categories, sizes, colors, onReload, toast }: AttributesDialogProps) {
  const [tab, setTab] = useState<'categories' | 'sizes' | 'colors'>('categories');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newOrder, setNewOrder] = useState(0);

  const handleAddCategory = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory({ name: newName, description: newDescription });
      toast({ title: 'Sucesso', description: 'Categoria adicionada', className: 'bg-green-600 text-white border-0' });
      setNewName('');
      setNewDescription('');
      onReload();
    } catch (error) {
      toast({ title: 'Erro', description: error instanceof Error ? error.message : 'Erro ao adicionar', variant: 'destructive' });
    }
  };

  const handleAddSize = async () => {
    if (!newName.trim()) return;
    try {
      await createSize({ name: newName, order: newOrder });
      toast({ title: 'Sucesso', description: 'Tamanho adicionado', className: 'bg-green-600 text-white border-0' });
      setNewName('');
      setNewOrder(0);
      onReload();
    } catch (error) {
      toast({ title: 'Erro', description: error instanceof Error ? error.message : 'Erro ao adicionar', variant: 'destructive' });
    }
  };

  const handleAddColor = async () => {
    if (!newName.trim()) return;
    try {
      // Create color using only the name (no hex selection required)
      await createColor({ name: newName });
      toast({ title: 'Sucesso', description: 'Cor adicionada', className: 'bg-green-600 text-white border-0' });
      setNewName('');
      // no hex to reset
      onReload();
    } catch (error) {
      toast({ title: 'Erro', description: error instanceof Error ? error.message : 'Erro ao adicionar', variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Deseja deletar esta categoria?')) return;
    try {
      await deleteCategory(id);
      toast({ title: 'Sucesso', description: 'Categoria deletada', className: 'bg-green-600 text-white border-0' });
      onReload();
    } catch (error) {
      toast({ title: 'Erro', description: error instanceof Error ? error.message : 'Erro ao deletar', variant: 'destructive' });
    }
  };

  const handleDeleteSize = async (id: string) => {
    if (!confirm('Deseja deletar este tamanho?')) return;
    try {
      await deleteSize(id);
      toast({ title: 'Sucesso', description: 'Tamanho deletado', className: 'bg-green-600 text-white border-0' });
      onReload();
    } catch (error) {
      toast({ title: 'Erro', description: error instanceof Error ? error.message : 'Erro ao deletar', variant: 'destructive' });
    }
  };

  const handleDeleteColor = async (id: string) => {
    if (!confirm('Deseja deletar esta cor?')) return;
    try {
      await deleteColor(id);
      toast({ title: 'Sucesso', description: 'Cor deletada', className: 'bg-green-600 text-white border-0' });
      onReload();
    } catch (error) {
      toast({ title: 'Erro', description: error instanceof Error ? error.message : 'Erro ao deletar', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Gerenciar Atributos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button onClick={() => setTab('categories')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              Categorias
            </button>
            <button onClick={() => setTab('sizes')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'sizes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              Tamanhos
            </button>
            <button onClick={() => setTab('colors')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'colors' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              Cores
            </button>
          </div>

          {/* Categorias */}
          {tab === 'categories' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Nome da categoria" value={newName} onChange={e => setNewName(e.target.value)} />
                <Input placeholder="Descrição (opcional)" value={newDescription} onChange={e => setNewDescription(e.target.value)} />
                <Button onClick={handleAddCategory} className="gap-2"><Plus className="h-4 w-4" /> Adicionar</Button>
              </div>
              <div className="space-y-2">
                {categories.map((cat: Category) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      {cat.description && <p className="text-sm text-muted-foreground">{cat.description}</p>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tamanhos */}
          {tab === 'sizes' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Nome do tamanho" value={newName} onChange={e => setNewName(e.target.value)} />
                <Input placeholder="Ordem" type="number" value={newOrder} onChange={e => setNewOrder(parseInt(e.target.value))} className="w-24" />
                <Button onClick={handleAddSize} className="gap-2"><Plus className="h-4 w-4" /> Adicionar</Button>
              </div>
              <div className="space-y-2">
                {sizes.map((size: Size) => (
                  <div key={size.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{size.name}</span>
                      <span className="text-xs text-muted-foreground">(Ordem: {size.order})</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSize(size.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cores */}
          {tab === 'colors' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Nome da cor" value={newName} onChange={e => setNewName(e.target.value)} />
                <Button onClick={handleAddColor} className="gap-2"><Plus className="h-4 w-4" /> Adicionar</Button>
              </div>
              <div className="space-y-2">
                {colors.map((color: Color) => (
                  <div key={color.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {color.hexCode && <div className="w-6 h-6 rounded" style={{ backgroundColor: color.hexCode }} />}
                      <span className="font-medium">{color.name}</span>
                      {color.hexCode && <span className="text-xs text-muted-foreground">{color.hexCode}</span>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteColor(color.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
