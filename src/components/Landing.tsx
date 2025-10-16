import React from 'react';
import { Droplets, Leaf, BarChart3, Users, ArrowRight, CheckCircle, Sun, Battery, Zap, Shield, Wifi, CloudRain } from 'lucide-react';

interface LandingProps {
  onNavigateToAuth: () => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigateToAuth }) => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Droplets className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                WaterySoil
              </span>
            </div>
            <button
              onClick={onNavigateToAuth}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Entrar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center pt-16 pb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Agricultura{' '}
              <span className="bg-gradient-to-r from-blue-600 via-green-500 to-amber-500 bg-clip-text text-transparent">
                Inteligente
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Monitore suas plantações em tempo real com sensores IoT avançados. 
              Otimize recursos hídricos e maximize sua produtividade de forma sustentável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onNavigateToAuth}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-2"
              >
                Começar Agora
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/50 transition-all duration-300 flex items-center gap-2">
                Ver Demonstração
                <BarChart3 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                  <Droplets className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Umidade do Solo</h3>
                  <div className="text-3xl font-bold text-blue-600">68%</div>
                  <div className="text-sm text-gray-600">Ideal</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
                  <Leaf className="h-10 w-10 text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">pH do Solo</h3>
                  <div className="text-3xl font-bold text-green-600">6.8</div>
                  <div className="text-sm text-gray-600">Ótimo</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl">
                  <BarChart3 className="h-10 w-10 text-amber-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Temperatura</h3>
                  <div className="text-3xl font-bold text-amber-600">24°C</div>
                  <div className="text-sm text-gray-600">Perfeita</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Tecnologia que{' '}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Transforma
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma utiliza sensores IoT de última geração para fornecer 
              insights precisos sobre suas culturas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Droplets className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Monitoramento em Tempo Real</h3>
              <p className="text-gray-600 leading-relaxed">
                Acompanhe a umidade, pH e temperatura do solo 24/7 com 
                alertas instantâneos para otimização contínua.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sustentabilidade Inteligente</h3>
              <p className="text-gray-600 leading-relaxed">
                Reduza o desperdício de água em até 40% com irrigação 
                automatizada baseada em dados precisos do solo.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="bg-amber-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics Avançados</h3>
              <p className="text-gray-600 leading-relaxed">
                Dashboards intuitivos com predições de crescimento e 
                recomendações personalizadas para cada cultura.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Module Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-6 py-2 mb-6">
              <Leaf className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-semibold">Nosso Produto</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              ECO-SOIL PRO
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Módulo autônomo e sustentável com energia solar,
              projetado para monitoramento 24/7 em qualquer condição climática
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 lg:order-1">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
                <img
                  src="/images/1.PNG"
                  alt="ECO-SOIL PRO - Vista lateral"
                  className="w-full rounded-2xl shadow-2xl"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-xl">
                    <Sun className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Energia Solar Integrada</h3>
                    <p className="text-gray-300">
                      Painel solar de alta eficiência carrega durante o dia,
                      garantindo operação contínua sem custos de energia.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-yellow-500/10 border border-green-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-green-500/20 p-3 rounded-xl">
                    <Battery className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Bateria de Longa Duração</h3>
                    <p className="text-gray-300">
                      Sistema de armazenamento inteligente mantém o dispositivo
                      funcionando perfeitamente durante a noite e dias nublados.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500/20 p-3 rounded-xl">
                    <Wifi className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Conectividade IoT</h3>
                    <p className="text-gray-300">
                      Transmissão em tempo real de dados para a nuvem,
                      acessível de qualquer lugar através do seu smartphone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-cyan-500/20 p-3 rounded-xl">
                    <Shield className="h-8 w-8 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Design Resistente</h3>
                    <p className="text-gray-300">
                      Carcaça IP67 à prova d'água e poeira, projetada para
                      resistir às condições mais adversas do campo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500/20 p-3 rounded-xl">
                    <Zap className="h-8 w-8 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Instalação Rápida</h3>
                    <p className="text-gray-300">
                      Sistema plug-and-play: basta inserir as sondas no solo
                      e ativar. Começa a monitorar em segundos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500/20 p-3 rounded-xl">
                    <CloudRain className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">100% Sustentável</h3>
                    <p className="text-gray-300">
                      Zero emissões, zero custos operacionais.
                      Tecnologia limpa que cuida do planeta enquanto cuida da sua lavoura.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
              <img
                src="/images/2.JPEG"
                alt="ECO-SOIL PRO - Vista frontal em campo"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-gray-300">Monitoramento Contínuo</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">0%</div>
                <div className="text-gray-300">Custo de Energia</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">IP67</div>
                <div className="text-gray-300">Proteção Total</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">5+ anos</div>
                <div className="text-gray-300">Vida Útil</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 text-green-400 text-sm font-medium">
              <Leaf className="h-4 w-4" />
              <span>Fabricado com materiais recicláveis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Resultados que{' '}
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Impressionam
                </span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Economia de até 40% na água
                    </h3>
                    <p className="text-gray-600">
                      Sistema inteligente de irrigação otimiza o uso de recursos hídricos 
                      baseado em dados precisos dos sensores.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Aumento de 25% na produtividade
                    </h3>
                    <p className="text-gray-600">
                      Monitoramento contínuo garante condições ideais para o 
                      crescimento saudável das plantas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Redução de 60% nas perdas
                    </h3>
                    <p className="text-gray-600">
                      Alertas preventivos identificam problemas antes que 
                      afetem significativamente a colheita.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Status da Fazenda</h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Ótimo
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600 mb-1">Irrigação</div>
                      <div className="text-2xl font-bold text-blue-600">18L/h</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-600 mb-1">Sensores</div>
                      <div className="text-2xl font-bold text-green-600">12/12</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Crescimento</span>
                        <span className="text-gray-900">89%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full w-[89%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Saúde do Solo</span>
                        <span className="text-gray-900">94%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-[94%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Pronto para Revolucionar sua Agricultura?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Junte-se a milhares de produtores que já estão economizando recursos 
            e aumentando sua produtividade com o WaterySoil.
          </p>
          <button
            onClick={onNavigateToAuth}
            className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 inline-flex items-center gap-2"
          >
            Começar Gratuitamente
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Droplets className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">WaterySoil</span>
            </div>
            <p className="text-gray-400">
              Transformando a agricultura através da tecnologia sustentável.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;