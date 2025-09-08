// Menu synchronization service to handle frontend menu data with database
import { supabase } from './supabase'
import { completeMenuItems } from './menu-data'
import type { MenuItem } from './types'

// Map frontend string IDs to database UUIDs
const menuIdMapping = new Map<string, string>()

export const menuSyncService = {
  // Initialize the mapping between frontend IDs and database UUIDs
  async initializeMapping(): Promise<void> {
    try {
      // Get all menu items from database
      const { data: dbMenuItems, error } = await supabase
        .from('menu_items')
        .select('id, name, price, category')
      
      if (error) {
        console.error('Error fetching menu items from database:', error)
        return
      }

      // Clear existing mapping
      menuIdMapping.clear()

      // Category mapping from frontend to database
      const categoryMapping: Record<string, string> = {
        'chai': 'Classic Chai',
        'iced-tea': 'Iced Tea & Green Tea',
        'hot-coffee': 'Hot Coffee',
        'cold-coffee': 'Cold Coffee',
        'burgers': 'Burgers',
        'maggie': 'Maggie',
        'sandwiches': 'Sandwiches',
        'pasta': 'Pasta',
        'bread': 'Bread',
        'fries': 'Fries',
        'pizza': 'Pizza',
        'milkshakes': 'Milkshakes',
        'mocktails': 'Mocktails',
        'combos': 'Combo Offers'
      }

      // Create mapping based on name and category matching
      completeMenuItems.forEach(frontendItem => {
        const dbCategory = categoryMapping[frontendItem.category] || frontendItem.category
        const dbItem = dbMenuItems.find(dbItem => {
          // Check exact name match first
          if (dbItem.name.toLowerCase().trim() === frontendItem.name.toLowerCase().trim() &&
              dbItem.category === dbCategory) {
            return true;
          }
          
          // Check if database name contains frontend name (for cases like "Coffee (Cold)" vs "Coffee")
          const dbNameBase = dbItem.name.replace(/\s*\([^)]*\)\s*/g, '').trim().toLowerCase();
          const frontendNameBase = frontendItem.name.trim().toLowerCase();
          
          return dbNameBase === frontendNameBase && dbItem.category === dbCategory;
        })
        
        if (dbItem) {
          menuIdMapping.set(frontendItem.id, dbItem.id)
        } else {
          console.warn(`No database match found for frontend item: ${frontendItem.name} (${frontendItem.id}) - Frontend category: ${frontendItem.category}, DB category: ${dbCategory}`)
        }
      })

      console.log(`Initialized menu mapping with ${menuIdMapping.size} items`)
    } catch (error) {
      console.error('Error initializing menu mapping:', error)
    }
  },

  // Convert frontend menu item ID to database UUID
  getDbId(frontendId: string): string | null {
    return menuIdMapping.get(frontendId) || null
  },

  // Get all mappings
  getAllMappings(): Map<string, string> {
    return new Map(menuIdMapping)
  },

  // Sync frontend menu items to database (create missing items)
  async syncMenuItems(): Promise<void> {
    try {
      // Category mapping from frontend to database
      const categoryMapping: Record<string, string> = {
        'chai': 'Classic Chai',
        'iced-tea': 'Iced Tea & Green Tea',
        'hot-coffee': 'Hot Coffee',
        'cold-coffee': 'Cold Coffee',
        'burgers': 'Burgers',
        'maggie': 'Maggie',
        'sandwiches': 'Sandwiches',
        'pasta': 'Pasta',
        'bread': 'Bread',
        'fries': 'Fries',
        'pizza': 'Pizza',
        'milkshakes': 'Milkshakes',
        'mocktails': 'Mocktails',
        'combos': 'Combo Offers'
      }

      // Get existing items from database
      const { data: existingItems, error: fetchError } = await supabase
        .from('menu_items')
        .select('name, category')
      
      if (fetchError) {
        console.error('Error fetching existing menu items:', fetchError)
        return
      }

      const existingItemsSet = new Set(
        existingItems.map(item => `${item.name.toLowerCase().trim()}_${item.category}`)
      )

      // Find items that need to be created
      const itemsToCreate = completeMenuItems.filter(frontendItem => {
        const dbCategory = categoryMapping[frontendItem.category] || frontendItem.category
        const key = `${frontendItem.name.toLowerCase().trim()}_${dbCategory}`
        return !existingItemsSet.has(key)
      })

      if (itemsToCreate.length > 0) {
        console.log(`Creating ${itemsToCreate.length} missing menu items in database`)
        
        // Insert missing items
        const { error: insertError } = await supabase
          .from('menu_items')
          .insert(
            itemsToCreate.map(item => {
              const dbCategory = categoryMapping[item.category] || item.category
              return {
                name: item.name,
                description: item.description,
                price: item.price,
                category: dbCategory,
                image: item.image,
                available: item.available,
                preparation_time: item.preparationTime,
                is_combo: item.isCombo || false,
                combo_items: item.comboItems || null
              }
            })
          )
        
        if (insertError) {
          console.error('Error inserting menu items:', insertError)
        } else {
          console.log('Successfully synced menu items to database')
          // Reinitialize mapping after sync
          await this.initializeMapping()
        }
      } else {
        console.log('All menu items are already synced')
      }
    } catch (error) {
      console.error('Error syncing menu items:', error)
    }
  }
}

// Initialize mapping on module load
menuSyncService.initializeMapping()