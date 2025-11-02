import React, { useState } from "react";
import {
  Page,
  Layouts,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Typography,
  Badge,
  Flex,
  IconButton,
} from "@strapi/design-system";
import { Plus, Trash, Pencil } from "@strapi/icons";
import { useLocales } from "../../hooks/useLocales";
import { useFetchClient, useNotification } from "@strapi/strapi/admin";
import pluginId from "../../pluginId";

const SettingsPage = () => {
  const { locales, isLoading, refetch } = useLocales();
  const { del } = useFetchClient();
  const toggleNotification = useNotification();

  const handleDelete = async (id: string, isDefault: boolean) => {
    if (isDefault) {
      toggleNotification({
        type: "warning",
        message: "No puedes eliminar el locale por defecto",
      });
      return;
    }

    if (window.confirm("¿Estás seguro de que quieres eliminar este locale?")) {
      try {
        await del(`/${pluginId}/locales/${id}`);
        toggleNotification({
          type: "success",
          message: "Locale eliminado correctamente",
        });
        refetch();
      } catch (error) {
        toggleNotification({
          type: "warning",
          message: "Error al eliminar el locale",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Page.Main>
        <Layouts.Header
          title="Internationalization"
          subtitle="Cargando locales..."
        />
      </Page.Main>
    );
  }

  return (
    <Page.Main>
      <Layouts.Header
        title="Internationalization"
        subtitle="Gestiona los idiomas disponibles para tu contenido"
      />
      <Layouts.Content>
        <Table colCount={4} rowCount={locales.length}>
          <Thead>
            <Tr>
              <Th>
                <Typography variant="sigma">Código</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Nombre</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Por defecto</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Acciones</Typography>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {locales.map((locale) => (
              <Tr key={locale.id}>
                <Td>
                  <Typography textColor="neutral800">{locale.code}</Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">{locale.name}</Typography>
                </Td>
                <Td>
                  {locale.isDefault && (
                    <Badge active>Por defecto</Badge>
                  )}
                </Td>
                <Td>
                  <Flex gap={1}>
                    <IconButton
                      onClick={() => handleDelete(locale.id, locale.isDefault)}
                      label="Eliminar"
                      disabled={locale.isDefault}
                    >
                      <Trash />
                    </IconButton>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Layouts.Content>
    </Page.Main>
  );
};

export default SettingsPage;
