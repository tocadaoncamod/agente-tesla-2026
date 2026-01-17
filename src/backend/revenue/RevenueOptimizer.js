const memorySystem = require('../learning/MemorySystem');

/**
 * RevenueOptimizer - Otimiza conversões e maximiza receita
 * Analisa métricas, testa variações, sugere melhorias
 */
class RevenueOptimizer {
    constructor() {
        this.experiments = [];
        this.conversions = [];
        this.recommendations = [];
    }

    /**
     * Analisa funil de conversão
     */
    analyzeFunnel(funnelData) {
        console.log('[RevenueOptimizer] 📊 Analisando funil de conversão...');

        const analysis = {
            stages: [],
            totalDropoff: 0,
            bottlenecks: [],
            conversionRate: 0
        };

        // Calcula taxas de conversão por estágio
        for (let i = 0; i < funnelData.length - 1; i++) {
            const current = funnelData[i];
            const next = funnelData[i + 1];

            const dropoff = ((current.visitors - next.visitors) / current.visitors) * 100;

            const stage = {
                name: current.name,
                visitors: current.visitors,
                conversions: next.visitors,
                conversionRate: ((next.visitors / current.visitors) * 100).toFixed(2),
                dropoff: dropoff.toFixed(2)
            };

            analysis.stages.push(stage);

            // Detecta bottlenecks (dropoff > 50%)
            if (dropoff > 50) {
                analysis.bottlenecks.push({
                    stage: current.name,
                    dropoff: dropoff.toFixed(2),
                    severity: 'high'
                });
            }
        }

        // Taxa de conversão total
        if (funnelData.length > 0) {
            const first = funnelData[0].visitors;
            const last = funnelData[funnelData.length - 1].visitors;
            analysis.conversionRate = ((last / first) * 100).toFixed(2);
        }

        // Gerar recomendações
        analysis.recommendations = this.generateFunnelRecommendations(analysis);

        console.log(`[RevenueOptimizer] ✅ Taxa de conversão: ${analysis.conversionRate}%`);
        return analysis;
    }

    /**
     * Gera recomendações para funil
     */
    generateFunnelRecommendations(analysis) {
        const recommendations = [];

        // Recomendações para bottlenecks
        analysis.bottlenecks.forEach(bottleneck => {
            recommendations.push({
                type: 'bottleneck',
                priority: 'high',
                stage: bottleneck.stage,
                issue: `Alta taxa de abandono: ${bottleneck.dropoff}%`,
                suggestions: [
                    'Simplificar formulário neste estágio',
                    'Adicionar garantias e confiança',
                    'Melhorar clareza da proposta de valor',
                    'Reduzir fricção no processo'
                ]
            });
        });

        // Recomendação geral se conversão < 5%
        if (parseFloat(analysis.conversionRate) < 5) {
            recommendations.push({
                type: 'low_conversion',
                priority: 'critical',
                issue: `Taxa de conversão muito baixa: ${analysis.conversionRate}%`,
                suggestions: [
                    'Revisar targeting e qualificação de leads',
                    'Testar diferentes propostas de valor',
                    'Implementar urgência e escassez',
                    'Melhorar prova social'
                ]
            });
        }

        return recommendations;
    }

    /**
     * Cria teste A/B
     */
    createABTest(testName, variantA, variantB, metric) {
        const test = {
            id: Date.now().toString(),
            name: testName,
            variants: {
                A: { ...variantA, visitors: 0, conversions: 0 },
                B: { ...variantB, visitors: 0, conversions: 0 }
            },
            metric,
            status: 'running',
            startedAt: new Date().toISOString(),
            winner: null
        };

        this.experiments.push(test);

        console.log(`[RevenueOptimizer] 🧪 Teste A/B criado: ${testName}`);
        return test;
    }

    /**
     * Registra resultado de teste
     */
    recordTestResult(testId, variant, converted) {
        const test = this.experiments.find(t => t.id === testId);

        if (!test) {
            console.error(`[RevenueOptimizer] Teste ${testId} não encontrado`);
            return false;
        }

        if (!test.variants[variant]) {
            console.error(`[RevenueOptimizer] Variante ${variant} inválida`);
            return false;
        }

        test.variants[variant].visitors++;

        if (converted) {
            test.variants[variant].conversions++;
        }

        // Atualiza taxa de conversão
        test.variants[variant].conversionRate =
            (test.variants[variant].conversions / test.variants[variant].visitors * 100).toFixed(2);

        return true;
    }

    /**
     * Analisa teste A/B
     */
    analyzeABTest(testId, minSampleSize = 100) {
        const test = this.experiments.find(t => t.id === testId);

        if (!test) {
            return null;
        }

        const varA = test.variants.A;
        const varB = test.variants.B;

        // Verifica se tem amostra suficiente
        if (varA.visitors < minSampleSize || varB.visitors < minSampleSize) {
            return {
                status: 'insufficient_data',
                message: `Precisa de pelo menos ${minSampleSize} visitantes por variante`,
                currentSample: {
                    A: varA.visitors,
                    B: varB.visitors
                }
            };
        }

        // Calcula taxas
        const rateA = varA.conversions / varA.visitors;
        const rateB = varB.conversions / varB.visitors;

        // Determina vencedor (simplificado - sem significância estatística real)
        const improvement = ((rateB - rateA) / rateA * 100).toFixed(2);

        const analysis = {
            status: 'completed',
            variantA: {
                visitors: varA.visitors,
                conversions: varA.conversions,
                rate: (rateA * 100).toFixed(2) + '%'
            },
            variantB: {
                visitors: varB.visitors,
                conversions: varB.conversions,
                rate: (rateB * 100).toFixed(2) + '%'
            },
            winner: rateB > rateA ? 'B' : 'A',
            improvement: Math.abs(improvement) + '%',
            recommendation: rateB > rateA
                ? `Implementar variante B (melhoria de ${Math.abs(improvement)}%)`
                : `Manter variante A`
        };

        // Atualiza teste
        test.status = 'completed';
        test.winner = analysis.winner;
        test.completedAt = new Date().toISOString();

        console.log(`[RevenueOptimizer] ✅ Teste analisado: Vencedor = ${analysis.winner}`);
        return analysis;
    }

    /**
     * Calcula LTV (Lifetime Value)
     */
    calculateLTV(averagePurchase, purchaseFrequency, customerLifespan) {
        const ltv = averagePurchase * purchaseFrequency * customerLifespan;

        return {
            ltv: ltv.toFixed(2),
            averagePurchase: averagePurchase.toFixed(2),
            purchaseFrequency,
            customerLifespan,
            calculatedAt: new Date().toISOString()
        };
    }

    /**
     * Otimiza preço
     */
    optimizePrice(currentPrice, demand, costs) {
        console.log('[RevenueOptimizer] 💰 Otimizando precificação...');

        const markup = ((currentPrice - costs) / costs * 100);
        const suggestions = [];

        // Análise de markup
        if (markup < 20) {
            suggestions.push({
                type: 'low_margin',
                message: 'Margem muito baixa, considere aumentar preço',
                suggestedPrice: (costs * 1.4).toFixed(2), // 40% markup
                expectedImpact: 'Aumento de lucro de ' + ((costs * 1.4 - currentPrice) / currentPrice * 100).toFixed(0) + '%'
            });
        }

        // Análise de demanda
        if (demand === 'high') {
            suggestions.push({
                type: 'high_demand',
                message: 'Alta demanda, pode aumentar preço',
                suggestedPrice: (currentPrice * 1.15).toFixed(2),
                expectedImpact: 'Aumento de receita até queda de demanda'
            });
        } else if (demand === 'low') {
            suggestions.push({
                type: 'low_demand',
                message: 'Baixa demanda, considere reduzir preço',
                suggestedPrice: (currentPrice * 0.9).toFixed(2),
                expectedImpact: 'Possível aumento de volume'
            });
        }

        return {
            currentPrice,
            currentMarkup: markup.toFixed(2) + '%',
            suggestions,
            recommendedAction: suggestions[0]?.type || 'maintain'
        };
    }

    /**
     * Gera relatório de revenue
     */
    generateRevenueReport() {
        const completedTests = this.experiments.filter(t => t.status === 'completed');

        const report = {
            totalExperiments: this.experiments.length,
            completedExperiments: completedTests.length,
            runningExperiments: this.experiments.filter(t => t.status === 'running').length,
            successfulOptimizations: completedTests.filter(t =>
                parseFloat(t.variants[t.winner].conversionRate) >
                parseFloat(t.variants[t.winner === 'A' ? 'B' : 'A'].conversionRate)
            ).length,
            recommendations: this.recommendations,
            generatedAt: new Date().toISOString()
        };

        return report;
    }

    /**
     * Adiciona recomendação
     */
    addRecommendation(type, message, priority = 'medium') {
        this.recommendations.push({
            type,
            message,
            priority,
            createdAt: new Date().toISOString(),
            implemented: false
        });
    }

    /**
     * Obtém recomendações ativas
     */
    getRecommendations(priorityFilter = null) {
        let recs = this.recommendations.filter(r => !r.implemented);

        if (priorityFilter) {
            recs = recs.filter(r => r.priority === priorityFilter);
        }

        return recs.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }
}

module.exports = new RevenueOptimizer();
