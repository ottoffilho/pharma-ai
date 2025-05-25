#!/usr/bin/env python3
"""
Script para importação de XML de Nota Fiscal Eletrônica (NF-e)
Pharma.AI - Módulo de Importação Fiscal

Este script processa arquivos XML de NF-e e importa os dados para o banco de dados
seguindo a estrutura definida no schema do projeto.

Autor: Pharma.AI Team
Data: 2025-01-XX
Versão: 1.0.0
"""

import xml.etree.ElementTree as ET
import json
import re
from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from pathlib import Path

# Imports para integração com Supabase (a serem ajustados conforme configuração)
# from supabase import create_client, Client
# import os


@dataclass
class FornecedorData:
    """Dados do fornecedor extraídos do XML"""
    cnpj: str
    razao_social: str
    nome_fantasia: Optional[str]
    inscricao_estadual: Optional[str]
    inscricao_municipal: Optional[str]
    cnae: Optional[str]
    crt: Optional[int]
    telefone: Optional[str]
    logradouro: str
    numero: str
    complemento: Optional[str]
    bairro: str
    cidade: str
    uf: str
    cep: str
    codigo_municipio: str


@dataclass
class LoteData:
    """Dados do lote extraídos do XML"""
    numero_lote: str
    data_fabricacao: Optional[str]
    data_validade: Optional[str]
    quantidade: Decimal


@dataclass
class ProdutoData:
    """Dados do produto extraídos do XML"""
    codigo_interno: str
    codigo_ean: str
    nome: str
    ncm: str
    cfop: str
    unidade_comercial: str
    unidade_tributaria: str
    origem: int
    lote: Optional[LoteData]


@dataclass
class ItemNotaFiscalData:
    """Dados do item da nota fiscal"""
    numero_item: int
    produto: ProdutoData
    quantidade_comercial: Decimal
    valor_unitario_comercial: Decimal
    quantidade_tributaria: Decimal
    valor_unitario_tributario: Decimal
    valor_total_produto: Decimal
    valor_frete: Decimal

    # Dados fiscais
    cfop: str
    ncm: str
    origem_mercadoria: int
    cst_icms: str
    base_calculo_icms: Decimal
    aliquota_icms: Decimal
    valor_icms: Decimal
    cst_ipi: str
    valor_ipi: Decimal
    cst_pis: str
    aliquota_pis: Decimal
    valor_pis: Decimal
    cst_cofins: str
    aliquota_cofins: Decimal
    valor_cofins: Decimal
    valor_total_tributos: Decimal


@dataclass
class NotaFiscalData:
    """Dados principais da nota fiscal"""
    chave_acesso: str
    numero_nf: int
    serie: int
    modelo: int
    data_emissao: str
    data_saida_entrada: str
    fornecedor: FornecedorData
    valor_produtos: Decimal
    valor_frete: Decimal
    valor_total_nota: Decimal
    valor_icms: Decimal
    valor_ipi: Decimal
    valor_pis: Decimal
    valor_cofins: Decimal
    valor_total_tributos: Decimal
    itens: List[ItemNotaFiscalData]


class NFeXMLProcessor:
    """Processador de XML de NF-e"""

    def __init__(self):
        # Namespace padrão da NF-e
        self.ns = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}

    def processar_xml(self, caminho_xml: str) -> NotaFiscalData:
        """
        Processa um arquivo XML de NF-e e extrai todos os dados relevantes

        Args:
            caminho_xml: Caminho para o arquivo XML

        Returns:
            NotaFiscalData: Dados estruturados da nota fiscal
        """
        try:
            tree = ET.parse(caminho_xml)
            root = tree.getroot()

            # Encontrar o elemento infNFe
            inf_nfe = root.find('.//nfe:infNFe', self.ns)
            if inf_nfe is None:
                raise ValueError("Elemento infNFe não encontrado no XML")

            # Extrair dados principais
            chave_acesso = inf_nfe.get('Id', '').replace('NFe', '')

            # Dados de identificação
            ide = inf_nfe.find('nfe:ide', self.ns)
            numero_nf = int(self._get_text(ide, 'nfe:nNF'))
            serie = int(self._get_text(ide, 'nfe:serie'))
            modelo = int(self._get_text(ide, 'nfe:mod'))
            data_emissao = self._get_text(ide, 'nfe:dhEmi')
            data_saida_entrada = self._get_text(ide, 'nfe:dhSaiEnt')

            # Dados do emitente (fornecedor)
            emit = inf_nfe.find('nfe:emit', self.ns)
            fornecedor = self._extrair_fornecedor(emit)

            # Dados dos totais
            total = inf_nfe.find('nfe:total/nfe:ICMSTot', self.ns)
            valor_produtos = Decimal(self._get_text(total, 'nfe:vProd'))
            valor_frete = Decimal(self._get_text(total, 'nfe:vFrete'))
            valor_total_nota = Decimal(self._get_text(total, 'nfe:vNF'))
            valor_icms = Decimal(self._get_text(total, 'nfe:vICMS'))
            valor_ipi = Decimal(self._get_text(total, 'nfe:vIPI'))
            valor_pis = Decimal(self._get_text(total, 'nfe:vPIS'))
            valor_cofins = Decimal(self._get_text(total, 'nfe:vCOFINS'))
            valor_total_tributos = Decimal(
                self._get_text(total, 'nfe:vTotTrib'))

            # Processar itens
            itens = []
            for det in inf_nfe.findall('nfe:det', self.ns):
                item = self._extrair_item(det)
                itens.append(item)

            return NotaFiscalData(
                chave_acesso=chave_acesso,
                numero_nf=numero_nf,
                serie=serie,
                modelo=modelo,
                data_emissao=data_emissao,
                data_saida_entrada=data_saida_entrada,
                fornecedor=fornecedor,
                valor_produtos=valor_produtos,
                valor_frete=valor_frete,
                valor_total_nota=valor_total_nota,
                valor_icms=valor_icms,
                valor_ipi=valor_ipi,
                valor_pis=valor_pis,
                valor_cofins=valor_cofins,
                valor_total_tributos=valor_total_tributos,
                itens=itens
            )

        except Exception as e:
            raise Exception(f"Erro ao processar XML: {str(e)}")

    def _extrair_fornecedor(self, emit) -> FornecedorData:
        """Extrai dados do fornecedor do XML"""
        endereco = emit.find('nfe:enderEmit', self.ns)

        return FornecedorData(
            cnpj=self._get_text(emit, 'nfe:CNPJ'),
            razao_social=self._get_text(emit, 'nfe:xNome'),
            nome_fantasia=self._get_text(emit, 'nfe:xFant'),
            inscricao_estadual=self._get_text(emit, 'nfe:IE'),
            inscricao_municipal=self._get_text(emit, 'nfe:IM'),
            cnae=self._get_text(emit, 'nfe:CNAE'),
            crt=self._get_int(emit, 'nfe:CRT'),
            telefone=self._get_text(emit, 'nfe:fone'),
            logradouro=self._get_text(endereco, 'nfe:xLgr'),
            numero=self._get_text(endereco, 'nfe:nro'),
            complemento=self._get_text(endereco, 'nfe:xCpl'),
            bairro=self._get_text(endereco, 'nfe:xBairro'),
            cidade=self._get_text(endereco, 'nfe:xMun'),
            uf=self._get_text(endereco, 'nfe:UF'),
            cep=self._get_text(endereco, 'nfe:CEP'),
            codigo_municipio=self._get_text(endereco, 'nfe:cMun')
        )

    def _extrair_item(self, det) -> ItemNotaFiscalData:
        """Extrai dados de um item da nota fiscal"""
        numero_item = int(det.get('nItem'))

        # Dados do produto
        prod = det.find('nfe:prod', self.ns)
        produto = self._extrair_produto(prod)

        # Dados de quantidades e valores
        quantidade_comercial = Decimal(self._get_text(prod, 'nfe:qCom'))
        valor_unitario_comercial = Decimal(self._get_text(prod, 'nfe:vUnCom'))
        quantidade_tributaria = Decimal(self._get_text(prod, 'nfe:qTrib'))
        valor_unitario_tributario = Decimal(
            self._get_text(prod, 'nfe:vUnTrib'))
        valor_total_produto = Decimal(self._get_text(prod, 'nfe:vProd'))
        valor_frete = Decimal(self._get_text(prod, 'nfe:vFrete', '0'))

        # Dados fiscais
        imposto = det.find('nfe:imposto', self.ns)

        # ICMS
        icms = imposto.find('.//nfe:ICMS00', self.ns) or imposto.find(
            './/nfe:ICMS10', self.ns) or imposto.find('.//nfe:ICMS20', self.ns)
        origem_mercadoria = self._get_int(icms, 'nfe:orig')
        cst_icms = self._get_text(icms, 'nfe:CST')
        base_calculo_icms = Decimal(self._get_text(icms, 'nfe:vBC', '0'))
        aliquota_icms = Decimal(self._get_text(icms, 'nfe:pICMS', '0'))
        valor_icms = Decimal(self._get_text(icms, 'nfe:vICMS', '0'))

        # IPI
        ipi = imposto.find('.//nfe:IPITrib', self.ns)
        cst_ipi = self._get_text(ipi, 'nfe:CST') if ipi is not None else ''
        valor_ipi = Decimal(self._get_text(ipi, 'nfe:vIPI', '0')
                            ) if ipi is not None else Decimal('0')

        # PIS
        pis = imposto.find('.//nfe:PISAliq', self.ns)
        cst_pis = self._get_text(pis, 'nfe:CST') if pis is not None else ''
        aliquota_pis = Decimal(self._get_text(
            pis, 'nfe:pPIS', '0')) if pis is not None else Decimal('0')
        valor_pis = Decimal(self._get_text(pis, 'nfe:vPIS', '0')
                            ) if pis is not None else Decimal('0')

        # COFINS
        cofins = imposto.find('.//nfe:COFINSAliq', self.ns)
        cst_cofins = self._get_text(
            cofins, 'nfe:CST') if cofins is not None else ''
        aliquota_cofins = Decimal(self._get_text(
            cofins, 'nfe:pCOFINS', '0')) if cofins is not None else Decimal('0')
        valor_cofins = Decimal(self._get_text(
            cofins, 'nfe:vCOFINS', '0')) if cofins is not None else Decimal('0')

        valor_total_tributos = Decimal(
            self._get_text(imposto, 'nfe:vTotTrib', '0'))

        return ItemNotaFiscalData(
            numero_item=numero_item,
            produto=produto,
            quantidade_comercial=quantidade_comercial,
            valor_unitario_comercial=valor_unitario_comercial,
            quantidade_tributaria=quantidade_tributaria,
            valor_unitario_tributario=valor_unitario_tributario,
            valor_total_produto=valor_total_produto,
            valor_frete=valor_frete,
            cfop=self._get_text(prod, 'nfe:CFOP'),
            ncm=self._get_text(prod, 'nfe:NCM'),
            origem_mercadoria=origem_mercadoria,
            cst_icms=cst_icms,
            base_calculo_icms=base_calculo_icms,
            aliquota_icms=aliquota_icms,
            valor_icms=valor_icms,
            cst_ipi=cst_ipi,
            valor_ipi=valor_ipi,
            cst_pis=cst_pis,
            aliquota_pis=aliquota_pis,
            valor_pis=valor_pis,
            cst_cofins=cst_cofins,
            aliquota_cofins=aliquota_cofins,
            valor_cofins=valor_cofins,
            valor_total_tributos=valor_total_tributos
        )

    def _extrair_produto(self, prod) -> ProdutoData:
        """Extrai dados do produto"""
        # Dados do lote (se existir)
        lote = None
        rastro = prod.find('nfe:rastro', self.ns)
        if rastro is not None:
            lote = LoteData(
                numero_lote=self._get_text(rastro, 'nfe:nLote'),
                data_fabricacao=self._get_text(rastro, 'nfe:dFab'),
                data_validade=self._get_text(rastro, 'nfe:dVal'),
                quantidade=Decimal(self._get_text(rastro, 'nfe:qLote'))
            )

        return ProdutoData(
            codigo_interno=self._get_text(prod, 'nfe:cProd'),
            codigo_ean=self._get_text(prod, 'nfe:cEAN'),
            nome=self._get_text(prod, 'nfe:xProd'),
            ncm=self._get_text(prod, 'nfe:NCM'),
            cfop=self._get_text(prod, 'nfe:CFOP'),
            unidade_comercial=self._get_text(prod, 'nfe:uCom'),
            unidade_tributaria=self._get_text(prod, 'nfe:uTrib'),
            origem=self._get_int(prod, 'nfe:orig', 0),
            lote=lote
        )

    def _get_text(self, element, tag: str, default: str = '') -> str:
        """Obtém texto de um elemento XML"""
        if element is None:
            return default
        found = element.find(tag, self.ns)
        return found.text if found is not None and found.text else default

    def _get_int(self, element, tag: str, default: int = 0) -> int:
        """Obtém valor inteiro de um elemento XML"""
        text = self._get_text(element, tag)
        try:
            return int(text) if text else default
        except ValueError:
            return default


class DatabaseImporter:
    """Classe para importar dados para o banco de dados"""

    def __init__(self):
        # Configuração do Supabase (a ser ajustada conforme ambiente)
        # self.supabase: Client = create_client(
        #     os.getenv("SUPABASE_URL"),
        #     os.getenv("SUPABASE_ANON_KEY")
        # )
        pass

    def importar_nota_fiscal(self, dados_nf: NotaFiscalData) -> Dict[str, Any]:
        """
        Importa uma nota fiscal completa para o banco de dados

        Args:
            dados_nf: Dados estruturados da nota fiscal

        Returns:
            Dict com resultado da importação
        """
        resultado = {
            'sucesso': False,
            'fornecedor_id': None,
            'nota_fiscal_id': None,
            'produtos_importados': 0,
            'lotes_criados': 0,
            'erros': []
        }

        try:
            # 1. Importar/atualizar fornecedor
            fornecedor_id = self._importar_fornecedor(dados_nf.fornecedor)
            resultado['fornecedor_id'] = fornecedor_id

            # 2. Importar produtos e lotes
            produtos_lotes = {}
            for item in dados_nf.itens:
                produto_id = self._importar_produto(
                    item.produto, fornecedor_id)
                produtos_lotes[produto_id] = None

                if item.produto.lote:
                    lote_id = self._importar_lote(
                        item.produto.lote, produto_id, item.valor_unitario_comercial)
                    produtos_lotes[produto_id] = lote_id
                    resultado['lotes_criados'] += 1

                resultado['produtos_importados'] += 1

            # 3. Importar nota fiscal
            nota_fiscal_id = self._importar_nota_fiscal(
                dados_nf, fornecedor_id)
            resultado['nota_fiscal_id'] = nota_fiscal_id

            # 4. Importar itens da nota fiscal
            for item in dados_nf.itens:
                produto_id = self._buscar_produto_por_codigo(
                    item.produto.codigo_interno)
                lote_id = produtos_lotes.get(produto_id)
                self._importar_item_nota_fiscal(
                    item, nota_fiscal_id, produto_id, lote_id)

            resultado['sucesso'] = True

        except Exception as e:
            resultado['erros'].append(str(e))

        return resultado

    def _importar_fornecedor(self, fornecedor: FornecedorData) -> str:
        """Importa ou atualiza dados do fornecedor"""
        # Implementação da inserção/atualização no Supabase
        # Esta é uma versão simplificada - implementar com Supabase client
        print(f"Importando fornecedor: {fornecedor.razao_social}")
        return "uuid-fornecedor-exemplo"

    def _importar_produto(self, produto: ProdutoData, fornecedor_id: str) -> str:
        """Importa ou atualiza dados do produto"""
        print(f"Importando produto: {produto.nome}")
        return "uuid-produto-exemplo"

    def _importar_lote(self, lote: LoteData, produto_id: str, preco_custo: Decimal) -> str:
        """Importa dados do lote"""
        print(f"Importando lote: {lote.numero_lote}")
        return "uuid-lote-exemplo"

    def _importar_nota_fiscal(self, dados_nf: NotaFiscalData, fornecedor_id: str) -> str:
        """Importa dados principais da nota fiscal"""
        print(f"Importando nota fiscal: {dados_nf.numero_nf}")
        return "uuid-nota-fiscal-exemplo"

    def _importar_item_nota_fiscal(self, item: ItemNotaFiscalData, nota_fiscal_id: str, produto_id: str, lote_id: str):
        """Importa item da nota fiscal"""
        print(f"Importando item: {item.produto.nome}")

    def _buscar_produto_por_codigo(self, codigo: str) -> str:
        """Busca produto pelo código interno"""
        return "uuid-produto-exemplo"


def main():
    """Função principal para teste do processamento"""
    # Caminho para o XML de exemplo
    caminho_xml = "src/assets/nf/35250562134671000100550000002590121734523410-nfe.xml"

    if not Path(caminho_xml).exists():
        print(f"Arquivo XML não encontrado: {caminho_xml}")
        return

    try:
        # Processar XML
        processor = NFeXMLProcessor()
        dados_nf = processor.processar_xml(caminho_xml)

        print("=== DADOS EXTRAÍDOS DA NOTA FISCAL ===")
        print(f"Chave de Acesso: {dados_nf.chave_acesso}")
        print(f"Número: {dados_nf.numero_nf}")
        print(f"Fornecedor: {dados_nf.fornecedor.razao_social}")
        print(f"Valor Total: R$ {dados_nf.valor_total_nota}")
        print(f"Quantidade de Itens: {len(dados_nf.itens)}")

        print("\n=== PRODUTOS IDENTIFICADOS ===")
        # Mostrar apenas os primeiros 5
        for i, item in enumerate(dados_nf.itens[:5], 1):
            print(f"{i}. {item.produto.nome} - R$ {item.valor_unitario_comercial}")
            if item.produto.lote:
                print(
                    f"   Lote: {item.produto.lote.numero_lote} (Val: {item.produto.lote.data_validade})")

        if len(dados_nf.itens) > 5:
            print(f"... e mais {len(dados_nf.itens) - 5} produtos")

        # Importar para banco (descomentado quando configurar Supabase)
        # importer = DatabaseImporter()
        # resultado = importer.importar_nota_fiscal(dados_nf)
        # print(f"\n=== RESULTADO DA IMPORTAÇÃO ===")
        # print(json.dumps(resultado, indent=2, default=str))

    except Exception as e:
        print(f"Erro: {e}")


if __name__ == "__main__":
    main()
