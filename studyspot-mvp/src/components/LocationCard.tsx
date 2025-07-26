import React from 'react';
import { StudyLocation } from '../types';
import { calculateDistance, getCategoryLabel, formatOpeningHours, formatPricing, isCurrentlyOpen } from '../utils';

interface LocationCardProps {
  location: StudyLocation;
  userLocation?: { latitude: number; longitude: number } | null;
  onClick: () => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, userLocation, onClick }) => {
  const distance = userLocation ? calculateDistance(userLocation, location.coordinates) : null;
  const isOpen = isCurrentlyOpen(location.basicInfo.openingHours);
  
  return (
    <div 
      onClick={onClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px 0',
        cursor: 'pointer',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
            {location.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ 
              backgroundColor: '#007AFF', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {getCategoryLabel(location.category)}
            </span>
            {distance && (
              <span style={{ color: '#666', fontSize: '14px' }}>
                {distance}km
              </span>
            )}
            <span style={{ 
              color: isOpen ? '#00C851' : '#FF3547', 
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {isOpen ? '営業中' : '休業中'}
            </span>
          </div>
          
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
            {location.address}
          </p>
          
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#333' }}>
              {formatOpeningHours(location.basicInfo.openingHours)}
            </span>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#007AFF' }}>
              {formatPricing(location.basicInfo.pricing)}
            </span>
          </div>
          
          {/* 評価とレビュー数 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {'★'.repeat(Math.round(location.stats.averageRating))}
              {'☆'.repeat(5 - Math.round(location.stats.averageRating))}
              <span style={{ marginLeft: '4px', fontSize: '14px', color: '#666' }}>
                {location.stats.averageRating}
              </span>
            </div>
            <span style={{ fontSize: '14px', color: '#666' }}>
              ({location.stats.reviewCount}件のレビュー)
            </span>
          </div>
          
          {/* 設備アイコン */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {location.facilities.wifi && (
              <span style={{ 
                backgroundColor: '#E3F2FD', 
                color: '#1976D2', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontSize: '12px' 
              }}>
                Wi-Fi
              </span>
            )}
            {location.facilities.power && (
              <span style={{ 
                backgroundColor: '#E8F5E8', 
                color: '#2E7D32', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontSize: '12px' 
              }}>
                電源
              </span>
            )}
            {location.facilities.quiet && (
              <span style={{ 
                backgroundColor: '#F3E5F5', 
                color: '#7B1FA2', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontSize: '12px' 
              }}>
                静か
              </span>
            )}
            {location.facilities.food && (
              <span style={{ 
                backgroundColor: '#FFF3E0', 
                color: '#F57C00', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontSize: '12px' 
              }}>
                飲食OK
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
