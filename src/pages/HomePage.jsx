import HeroSlider from '../components/HeroSlider';
import PopularModelsSection from '../components/PopularModelsSection';
import SeasonalComfortSection from '../components/SeasonalComfortSection';
import InstallationSection from '../components/InstallationSection';

export default function HomePage({ favoriteIds, onToggleFavorite, onAddToCart, catalogProducts }) {
  return (
    <main>
      <HeroSlider />
      <PopularModelsSection
        favoriteIds={favoriteIds}
        onToggleFavorite={onToggleFavorite}
        onAddToCart={onAddToCart}
        catalogProducts={catalogProducts}
      />
      <SeasonalComfortSection />
      <InstallationSection />
    </main>
  );
}
