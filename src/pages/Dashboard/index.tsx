import React, { useState, useEffect, useCallback } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      api.get('foods').then(({ data }) => setFoods(data));
    }

    loadFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>) => {
      try {
        const { description, image, name, price } = food;
        const { data } = await api.post('foods', {
          description,
          image,
          name,
          price,
        });
        setFoods(items => [data, ...items]);
      } catch (err) {
        console.log(err);
      }
    },
    [],
  );

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>) => {
      try {
        const { id } = editingFood;

        await api.put(`foods/${id}`, food);

        setFoods(currentState =>
          currentState.map(foodSaved => {
            if (id === foodSaved.id) {
              return {
                ...foodSaved,
                ...food,
              };
            }
            return foodSaved;
          }),
        );
      } catch (error) {
        console.log(error);
      }
    },
    [editingFood],
  );

  const handleDeleteFood = useCallback(async (id: number) => {
    try {
      await api.delete(`foods/${id}`);

      setFoods(items => items.filter(food => food.id !== id));
    } catch (error) {
      console.log(error);
    }
  }, []);

  const toggleModal = useCallback(() => {
    setModalOpen(currentState => !currentState);
  }, [setModalOpen]);

  const toggleEditModal = useCallback(() => {
    setEditModalOpen(currentState => !currentState);
  }, [setEditModalOpen]);

  const handleEditFood = useCallback(
    (newFoodData: IFoodPlate) => {
      setEditingFood(newFoodData);
      toggleEditModal();
    },
    [toggleEditModal],
  );

  const handleUpdateFoodAvailable = useCallback(async (food: IFoodPlate) => {
    try {
      await api.put(`foods/${food.id}`, food);

      setFoods(currentState =>
        currentState.map(foodSaved => {
          if (food.id === foodSaved.id) {
            return {
              ...foodSaved,
              ...food,
            };
          }
          return foodSaved;
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleUpdateFoodAvailable={handleUpdateFoodAvailable}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
