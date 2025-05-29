# Exemplos Práticos - Sistema de Markup

## 🎯 Cenários de Uso Real

### Cenário 1: Cadastro Manual de Insumo

**Situação:** Farmacêutico cadastra novo insumo manualmente

```typescript
// Dados de entrada
const novoInsumo = {
    nome: "Arnica Montana 6CH",
    categoria: "medicamentos",
    preco_custo: 0.10, // R$ 0,10 por grama
    unidade: "grama",
};

// Sistema sugere markup baseado na categoria
const markupSugerido = 6; // Para categoria "medicamentos"

// Cálculo automático
const precoVenda = 0.10 * 6; // R$ 0,60 por grama
const margemLucro = ((0.60 - 0.10) / 0.10) * 100; // 500%

// Resultado final
const insumoFinal = {
    ...novoInsumo,
    markup: 6,
    preco_venda: 0.60,
    markup_personalizado: false,
    margem_lucro: 500,
};
```

### Cenário 2: Importação de NF-e

**Situação:** Importação de XML com múltiplos produtos

```typescript
// Dados do XML (simplificado)
const produtosXML = [
    { codigo: "001", nome: "Calendula Officinalis", preco_custo: 0.15 },
    { codigo: "002", nome: "Arnica Montana", preco_custo: 0.10 },
    { codigo: "003", nome: "Vitamina C", preco_custo: 0.25 },
];

// Configuração de importação
const configImportacao = {
    markup_padrao: 6,
    aplicar_automatico: true,
    revisar_antes_salvar: true,
};

// Processamento automático
const produtosProcessados = produtosXML.map((produto) => ({
    ...produto,
    markup_sugerido: 6,
    preco_venda_calculado: produto.preco_custo * 6,
    margem_calculada:
        ((produto.preco_custo * 6 - produto.preco_custo) /
            produto.preco_custo) * 100,
    requer_revisao: false,
}));

// Resultado
/*
[
  { codigo: "001", nome: "Calendula Officinalis", preco_custo: 0.15, preco_venda: 0.90, margem: 500% },
  { codigo: "002", nome: "Arnica Montana", preco_custo: 0.10, preco_venda: 0.60, margem: 500% },
  { codigo: "003", nome: "Vitamina C", preco_custo: 0.25, preco_venda: 1.50, margem: 500% }
]
*/
```

### Cenário 3: Ajuste de Markup por Categoria

**Situação:** Farmácia decide aumentar markup de cosméticos

```typescript
// Configuração atual
const categoriasMarkup = [
    { categoria: "medicamentos", markup_atual: 6 },
    { categoria: "cosmeticos", markup_atual: 8 },
    { categoria: "suplementos", markup_atual: 10 },
];

// Nova configuração
const novaConfiguracao = {
    categoria: "cosmeticos",
    markup_novo: 10, // Aumentou de 8 para 10
};

// Produtos afetados
const produtosCosmeticos = [
    { id: 1, nome: "Creme Hidratante", preco_custo: 5.00, markup_atual: 8 },
    { id: 2, nome: "Protetor Solar", preco_custo: 8.00, markup_atual: 8 },
];

// Cálculo das alterações
const alteracoes = produtosCosmeticos.map((produto) => ({
    ...produto,
    markup_anterior: produto.markup_atual,
    markup_novo: 10,
    preco_venda_anterior: produto.preco_custo * produto.markup_atual,
    preco_venda_novo: produto.preco_custo * 10,
    diferenca_preco: (produto.preco_custo * 10) -
        (produto.preco_custo * produto.markup_atual),
}));

// Resultado
/*
[
  {
    id: 1, nome: "Creme Hidratante",
    preco_custo: 5.00,
    markup_anterior: 8, markup_novo: 10,
    preco_venda_anterior: 40.00, preco_venda_novo: 50.00,
    diferenca_preco: 10.00
  },
  {
    id: 2, nome: "Protetor Solar",
    preco_custo: 8.00,
    markup_anterior: 8, markup_novo: 10,
    preco_venda_anterior: 64.00, preco_venda_novo: 80.00,
    diferenca_preco: 16.00
  }
]
*/
```

---

## 🖥️ Exemplos de Interface

### Formulário de Cadastro com Markup

```tsx
// src/components/forms/FormularioInsumo.tsx
export function FormularioInsumo() {
    const [formData, setFormData] = useState({
        nome: "",
        categoria: "",
        preco_custo: 0,
        markup: 6,
        unidade: "grama",
    });

    const { calcularPreco, sugerirMarkup } = useMarkup();

    // Calcular preço automaticamente
    const calculo = calcularPreco(formData.preco_custo, formData.markup);

    // Sugerir markup quando categoria mudar
    useEffect(() => {
        if (formData.categoria) {
            const markupSugerido = sugerirMarkup(formData.categoria);
            setFormData((prev) => ({ ...prev, markup: markupSugerido }));
        }
    }, [formData.categoria]);

    return (
        <form className="space-y-4">
            <Input
                label="Nome do Insumo"
                value={formData.nome}
                onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nome: e.target.value }))}
            />

            <Select
                label="Categoria"
                value={formData.categoria}
                onChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoria: value }))}
            >
                <option value="medicamentos">Medicamentos</option>
                <option value="cosmeticos">Cosméticos</option>
                <option value="suplementos">Suplementos</option>
            </Select>

            <Input
                label="Preço de Custo (R$)"
                type="number"
                step="0.01"
                value={formData.preco_custo}
                onChange={(e) =>
                    setFormData((prev) => ({
                        ...prev,
                        preco_custo: Number(e.target.value),
                    }))}
            />

            <CampoMarkup
                value={formData.markup}
                onChange={(markup) =>
                    setFormData((prev) => ({ ...prev, markup }))}
                precoCusto={formData.preco_custo}
                categoria={formData.categoria}
            />

            {/* Resumo do cálculo */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Resumo da Precificação</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Preço de Custo:</span>
                        <span className="font-medium ml-2">
                            R$ {formData.preco_custo.toFixed(2)}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Markup:</span>
                        <span className="font-medium ml-2">
                            {formData.markup}x
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Preço de Venda:</span>
                        <span className="font-medium ml-2 text-green-600">
                            R$ {calculo.preco_venda.toFixed(2)}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Margem de Lucro:</span>
                        <span className="font-medium ml-2">
                            {calculo.margem_lucro.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        </form>
    );
}
```

### Preview de Importação NF-e

```tsx
// src/components/importacao/PreviewImportacao.tsx
export function PreviewImportacao(
    { produtosImportados }: { produtosImportados: ProdutoImportado[] },
) {
    const [produtos, setProdutos] = useState(produtosImportados);

    const atualizarMarkup = (index: number, novoMarkup: number) => {
        setProdutos((prev) =>
            prev.map((produto, i) =>
                i === index
                    ? {
                        ...produto,
                        markup: novoMarkup,
                        preco_venda: produto.preco_custo * novoMarkup,
                        markup_personalizado: true,
                    }
                    : produto
            )
        );
    };

    const totalValorCusto = produtos.reduce((sum, p) => sum + p.preco_custo, 0);
    const totalValorVenda = produtos.reduce((sum, p) => sum + p.preco_venda, 0);
    const margemMedia =
        ((totalValorVenda - totalValorCusto) / totalValorCusto) * 100;

    return (
        <div className="space-y-6">
            {/* Resumo geral */}
            <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Resumo da Importação</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Produtos:</span>
                        <span className="font-medium ml-2">
                            {produtos.length}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">
                            Valor Total Custo:
                        </span>
                        <span className="font-medium ml-2">
                            R$ {totalValorCusto.toFixed(2)}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">
                            Valor Total Venda:
                        </span>
                        <span className="font-medium ml-2 text-green-600">
                            R$ {totalValorVenda.toFixed(2)}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Margem Média:</span>
                        <span className="font-medium ml-2">
                            {margemMedia.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabela de produtos */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-300 p-2 text-left">
                                Produto
                            </th>
                            <th className="border border-gray-300 p-2 text-right">
                                Custo
                            </th>
                            <th className="border border-gray-300 p-2 text-center">
                                Markup
                            </th>
                            <th className="border border-gray-300 p-2 text-right">
                                Venda
                            </th>
                            <th className="border border-gray-300 p-2 text-right">
                                Margem
                            </th>
                            <th className="border border-gray-300 p-2 text-center">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {produtos.map((produto, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 p-2">
                                    <div>
                                        <div className="font-medium">
                                            {produto.nome}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {produto.codigo}
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-gray-300 p-2 text-right">
                                    R$ {produto.preco_custo.toFixed(2)}
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                    <Input
                                        type="number"
                                        value={produto.markup}
                                        onChange={(e) =>
                                            atualizarMarkup(
                                                index,
                                                Number(e.target.value),
                                            )}
                                        className="w-20 text-center"
                                        step="0.1"
                                        min="0"
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-right font-medium text-green-600">
                                    R$ {produto.preco_venda.toFixed(2)}
                                </td>
                                <td className="border border-gray-300 p-2 text-right">
                                    {(((produto.preco_venda -
                                        produto.preco_custo) /
                                        produto.preco_custo) * 100).toFixed(1)}%
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                    {produto.markup_personalizado && (
                                        <Badge variant="secondary">
                                            Personalizado
                                        </Badge>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Ações */}
            <div className="flex justify-between">
                <Button variant="outline">
                    Cancelar Importação
                </Button>
                <div className="space-x-2">
                    <Button variant="outline">
                        Salvar como Rascunho
                    </Button>
                    <Button>
                        Confirmar Importação
                    </Button>
                </div>
            </div>
        </div>
    );
}
```

---

## 📊 Relatórios e Dashboards

### Dashboard de Markup

```tsx
// src/components/dashboard/DashboardMarkup.tsx
export function DashboardMarkup() {
    const { data: metricas } = useQuery(
        ["dashboard-markup"],
        fetchMetricasMarkup,
    );

    if (!metricas) return <div>Carregando...</div>;

    return (
        <div className="space-y-6">
            {/* KPIs principais */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                            {metricas.total_produtos}
                        </div>
                        <div className="text-sm text-gray-600">
                            Total de Produtos
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                            {metricas.markup_medio.toFixed(1)}x
                        </div>
                        <div className="text-sm text-gray-600">
                            Markup Médio
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                            {metricas.margem_media.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">
                            Margem Média
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                            R$ {metricas.valor_total_estoque.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-600">
                            Valor Total Estoque
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição de Markup</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={metricas.distribuicao_markup}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="markup" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="quantidade" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Markup por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={metricas.markup_por_categoria}
                                    dataKey="markup_medio"
                                    nameKey="categoria"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#3b82f6"
                                    label
                                />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Alertas */}
            {metricas.alertas.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Alertas de Precificação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {metricas.alertas.map((alerta, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 bg-yellow-50 rounded"
                                >
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm">
                                        {alerta.mensagem}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="ml-auto"
                                    >
                                        Revisar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
```

---

## 🔧 Utilitários e Helpers

### Validações

```typescript
// src/utils/markupValidation.ts
export class MarkupValidation {
    static validarPreco(preco: number): { valido: boolean; erro?: string } {
        if (preco < 0) {
            return { valido: false, erro: "Preço não pode ser negativo" };
        }
        if (preco === 0) {
            return { valido: false, erro: "Preço deve ser maior que zero" };
        }
        if (preco > 999999) return { valido: false, erro: "Preço muito alto" };
        return { valido: true };
    }

    static validarMarkup(
        markup: number,
        config: ConfiguracaoMarkup,
    ): { valido: boolean; erro?: string } {
        if (!config.permitir_markup_zero && markup <= 0) {
            return { valido: false, erro: "Markup deve ser maior que zero" };
        }
        if (markup < config.markup_minimo) {
            return {
                valido: false,
                erro: `Markup mínimo é ${config.markup_minimo}`,
            };
        }
        if (markup > config.markup_maximo) {
            return {
                valido: false,
                erro: `Markup máximo é ${config.markup_maximo}`,
            };
        }
        return { valido: true };
    }

    static validarMargem(margem: number): { valido: boolean; alerta?: string } {
        if (margem < 50) {
            return { valido: true, alerta: "Margem baixa (< 50%)" };
        }
        if (margem > 1000) {
            return { valido: true, alerta: "Margem muito alta (> 1000%)" };
        }
        return { valido: true };
    }
}
```

### Formatadores

```typescript
// src/utils/markupFormatters.ts
export class MarkupFormatters {
    static formatarPreco(preco: number): string {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(preco);
    }

    static formatarMarkup(markup: number): string {
        return `${markup.toFixed(1)}x`;
    }

    static formatarMargem(margem: number): string {
        return `${margem.toFixed(1)}%`;
    }

    static formatarVariacao(valorAnterior: number, valorNovo: number): string {
        const variacao = ((valorNovo - valorAnterior) / valorAnterior) * 100;
        const sinal = variacao >= 0 ? "+" : "";
        return `${sinal}${variacao.toFixed(1)}%`;
    }
}
```

---

## 🧪 Testes

### Testes Unitários

```typescript
// src/services/__tests__/markupService.test.ts
describe("MarkupService", () => {
    describe("calcularPrecoVenda", () => {
        it("deve calcular preço de venda corretamente", () => {
            const resultado = MarkupService.calcularPrecoVenda(0.10, 6);
            expect(resultado).toBe(0.60);
        });

        it("deve arredondar para 2 casas decimais", () => {
            const resultado = MarkupService.calcularPrecoVenda(0.333, 3);
            expect(resultado).toBe(1.00);
        });

        it("deve lançar erro para preço de custo inválido", () => {
            expect(() => MarkupService.calcularPrecoVenda(0, 6)).toThrow();
            expect(() => MarkupService.calcularPrecoVenda(-1, 6)).toThrow();
        });
    });

    describe("calcularMargem", () => {
        it("deve calcular margem corretamente", () => {
            const resultado = MarkupService.calcularMargem(0.10, 0.60);
            expect(resultado).toBe(500);
        });

        it("deve retornar 0 para preço de custo zero", () => {
            const resultado = MarkupService.calcularMargem(0, 0.60);
            expect(resultado).toBe(0);
        });
    });
});
```

### Testes de Integração

```typescript
// src/components/__tests__/CampoMarkup.test.tsx
describe("CampoMarkup", () => {
    it("deve calcular preço automaticamente", () => {
        render(
            <CampoMarkup
                value={6}
                onChange={jest.fn()}
                precoCusto={0.10}
            />,
        );

        expect(screen.getByText("R$ 0,60")).toBeInTheDocument();
        expect(screen.getByText("500,0%")).toBeInTheDocument();
    });

    it("deve sugerir markup baseado na categoria", () => {
        render(
            <CampoMarkup
                value={6}
                onChange={jest.fn()}
                precoCusto={0.10}
                categoria="cosmeticos"
            />,
        );

        expect(screen.getByText("Sugerido: 8")).toBeInTheDocument();
    });
});
```

---

_Exemplos criados em: 26/12/2024_\
_Baseado nos requisitos da farmácia cliente_
