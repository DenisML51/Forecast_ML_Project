import React, { useContext, useEffect } from "react";
import { Box, Grid, Button, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import FilterPanel from "../components/FilterPanel";
import TableDisplay from "../components/TableDisplay";
import { DashboardContext } from "../context/DashboardContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    originalData,
    setOriginalData,
    filters,
    setFilters,
    sortColumn,
    setSortColumn,
    sortDirection,
    setSortDirection,
    filteredData,
    setFilteredData,
    tableData,
    setTableData,
    columns,
    setColumns,
    selectedColumns,
    setSelectedColumns,
    resetDashboardState,
  } = useContext(DashboardContext);

  // При изменении исходных данных, фильтров или параметров сортировки пересчитываем результирующий набор
  useEffect(() => {
    let data = [...originalData];
    Object.entries(filters).forEach(([column, value]) => {
      if (value) {
        data = data.filter((row) => row[column] === value);
      }
    });
    if (sortColumn && sortDirection) {
      data.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (!isNaN(valA) && !isNaN(valB)) {
          return sortDirection === "asc"
            ? Number(valA) - Number(valB)
            : Number(valB) - Number(valA);
        }
        return sortDirection === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
    setFilteredData(data);
    setTableData(data.slice(0, 5));
  }, [originalData, filters, sortColumn, sortDirection, setFilteredData, setTableData]);

  // Обработчики сортировки
  const handleSortAsc = (column) => {
    setSortColumn(column);
    setSortDirection("asc");
  };
  const handleSortDesc = (column) => {
    setSortColumn(column);
    setSortDirection("desc");
  };

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Выбор столбцов: пользователь может выбрать 2 столбца (дата и таргет)
  const handleColumnSelect = (column) => {
    setSelectedColumns((prevSelected) => {
      if (prevSelected.includes(column)) {
        return prevSelected.filter((col) => col !== column);
      }
      if (prevSelected.length >= 2) {
        return prevSelected;
      }
      return [...prevSelected, column];
    });
  };

  // Переход на страницу предобработки. Обратите внимание: для прогнозирования позже передадим полную выборку.
  const handleConfirmSelection = () => {
    if (selectedColumns.length === 2) {
      // Передаём full filteredData, а также выбранные столбцы и текущие фильтры
      navigate("/selected", { state: { selectedColumns, filteredData, filters } });
    }
  };

  // При нажатии на "Новый файл" сбрасываем состояние и сразу открываем диалог загрузки.
  const handleReset = () => {
    resetDashboardState();
    // Имитируем нажатие на скрытый input (FileUpload сам открывается)
    const fileInput = document.getElementById("upload-file");
    if (fileInput) fileInput.click();
  };

  return (
    <Grid container spacing={2} justifyContent="center" sx={{ p: 4 }}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 3, backgroundColor: "#1e1e1e", borderRadius: "16px" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" sx={{ color: "#fff" }}>
              Загрузите новый файл или сформируйте выборку
            </Typography>
            <Button variant="contained" color="error" onClick={handleReset} sx={{ borderRadius: "20px" }}>
              Новый файл
            </Button>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <FilterPanel
          originalData={originalData}
          columns={columns}
          filters={filters}
          updateFilters={updateFilters}
        />
      </Grid>
      <Grid item xs={12} md={9}>
        <FileUpload setOriginalData={setOriginalData} setColumns={setColumns} />
        {tableData.length > 0 && (
          <>
            <Box mt={4}>
              <TableDisplay
                data={tableData}
                onSortAsc={handleSortAsc}
                onSortDesc={handleSortDesc}
                onColumnSelect={handleColumnSelect}
                selectedColumns={selectedColumns}
              />
            </Box>
            {selectedColumns.length > 0 && (
              <Box mt={2} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="body1">
                  {selectedColumns.length >= 1 && `Столбец с датой: ${selectedColumns[0]}`}
                </Typography>
                {selectedColumns.length === 2 && (
                  <Typography variant="body1">
                    Целевая переменная: {selectedColumns[1]}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 1 }}
                  disabled={selectedColumns.length !== 2}
                  onClick={handleConfirmSelection}
                >
                  Подтвердить выбор
                </Button>
              </Box>
            )}
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default Dashboard;
