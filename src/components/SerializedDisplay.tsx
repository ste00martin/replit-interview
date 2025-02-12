import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { EvalResponseBody, SerializedType } from '../context/Backend';

const CollapsibleItem = ({ label, children }: { label: string; children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <View style={styles.collapsibleContainer}>
      <Pressable onPress={() => setCollapsed(!collapsed)} style={styles.header}>
        <Text style={styles.label}>{collapsed ? '▶ ' : '▼ '} {label}</Text>
      </Pressable>
      {!collapsed && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const RenderItem = ({ data, path, seenPaths }: { data: SerializedType; path: string; seenPaths: Set<string> }) => {
  if (typeof data.value === 'object' && data.value !== null) {
    if (seenPaths.has(path)) {
      return <Text style={styles.circularReference}>[Circular Reference]</Text>;
    }
    seenPaths.add(path);
  }

  switch (data.type) {
    case 'object':
      return (
        <>
          {data.value.map((key, index) => {
            console.log('value is', key)

            return (
              <RenderItem key={index} data={key.value} path={`${path}.${index}`} seenPaths={seenPaths} />
            )
          })}
        </>
      );

    case 'array':
      return (
        <>
          {data.value.map((value, index) => (
            <RenderItem key={index} data={{ type: typeof value, value }} path={`${path}.${index}`} seenPaths={seenPaths} />
          ))}
        </>
      );

    case 'error':
      return (
        <CollapsibleItem label="Error">
          <Text style={styles.errorText}>{data.value.name}: {data.value.message}</Text>
        </CollapsibleItem>
      );

    case 'undefined':
    case 'string':
    case 'number':
    case 'boolean':
      return (
        <View style={styles.item}>
          <Text style={styles.value}>{String(data.value)}</Text>
        </View>
      );

    default:
      return null;
  }
};

const SerializedDisplay = ({ response }: { response: EvalResponseBody }) => {
  const seenPaths = new Set<string>();

  return (
    <>
      {Object.entries(response.serialized).map(([key, value]) => (
        <RenderItem key={key} data={value} path={key} seenPaths={seenPaths} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  collapsibleContainer: {
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
  },
  header: {
    padding: 8,
    backgroundColor: '#ddd',
    borderRadius: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    marginTop: 5,
    paddingLeft: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  value: {
    fontSize: 14,
    color: '#555',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
  circularReference: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'orange',
  },
});

export default SerializedDisplay;